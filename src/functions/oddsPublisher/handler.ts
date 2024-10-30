import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { deleteMessage } from "@libs/sqs";
import { SQS_NOTIFICATION_TYPE, SqsNotification } from "@libs/types";
import { SQSEvent, SQSRecord } from "aws-lambda";
import * as http from "https";

exports.handler = async (event: SQSEvent) => {
  // There should be only 1 record as we group them by connectionId
  const notification = deserializeSqsRecord(event.Records[0]);
  if (notification.type !== SQS_NOTIFICATION_TYPE.ADD_CONNECTION_ID) {
    // some other event type. Nothing to process. We should ideally never reach this code
    return;
  }
  // now that we grabbed the connectionId, delete the message
  await deleteMessage(event.Records[0].receiptHandle);
  const connectionId = notification.data;
  try {
    console.log(`attempting to publish odds data to connectionId ${connectionId}`);
    await procesStreamChunks(connectionId);
  } catch (err) {
    // TODO: ignoring all errors for now. Ideally InactiveClientError alone should be ignored
  }
};

async function procesStreamChunks(connectionId: string) {
  const apiClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.WEBSOCKETS_CONNECTIONS_API,
  });
  const url = new URL(process.env.STREAMING_API_URL!);
  return new Promise((resolve, reject) => {
    const req = http.request(url, (res) => {
      res.on("data", async (chunk) => {
        // TODO: decode chunk. split new lines and consider the line with data string and JSON.parse its value
        await sendChunkToClient(apiClient, chunk.toString(), connectionId);
      });

      res.on("end", () => {
        console.log("Response completed");
        resolve("completed");
      });
    });

    req.on("error", (error) => {
      console.error("Error:", error);
      reject(error);
    });

    req.end();
  });
}

class InactiveClientError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function sendChunkToClient(apiClient: ApiGatewayManagementApiClient, payload: string, connectionId: string) {
  const postData = {
    Data: payload,
    ConnectionId: connectionId,
  };
  try {
    await apiClient.send(new PostToConnectionCommand(postData));
  } catch (err) {
    console.error("Failed to send chunks to connection id", connectionId, err);
    // TODO: Check if its GoneError
    // perhaps connection is no longer valid
    throw new InactiveClientError("Failed to send chunks to connection id" + connectionId);
  }
}

function deserializeSqsRecord(record: SQSRecord): SqsNotification {
  try {
    return JSON.parse(record.body) as SqsNotification;
  } catch (err) {
    console.error("SQSRecord data is not JSON payload. Can not deserialize it", record);
    return { type: -1 } as any;
  }
}
