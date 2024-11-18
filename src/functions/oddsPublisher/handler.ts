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
    await procesStreamChunks(connectionId);
  } catch (err) {
    // TODO: ignoring all errors for now. ideally errors are caught inside procesStreamChunks while handling request
    // this top level try-catch probably redundant
  }
};

async function procesStreamChunks(connectionId: string) {
  const apiClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.WEBSOCKETS_CONNECTIONS_API,
  });
  const url = new URL(process.env.STREAMING_API_URL!);
  const controller = new AbortController();

  const sanitizeLines = (lines: string[]) => {
    // valid data lines contain atleast one string with double quotes
    return lines.filter((line) => line.length > 0 && line.includes('"')).map((line) => line.replace(/^data: /, ""));
  };

  const attemptPublish = async (line: string) => {
    try {
      // console.log("sending chunk to client ", connectionId);
      await sendChunkToClient(apiClient, line, connectionId);
    } catch (err) {
      console.error(`Stopping streaming to client ${connectionId} due to `, err);
      clearInterval(publishInterval);
      controller.abort();
    }
  };
  let queue: string[] = [];

  let partialData = "";
  let beginData = false;
  const publishInterval = setInterval(async () => {
    for (let i = 0; i < queue.length; i++) {
      let line: string = queue.shift();
      // console.error("line is " + line);
      if (line.startsWith("data: {")) {
        beginData = true;
      }
      if (beginData) {
        line = line.replace(/^data: /, "");
        // if there is any partial data from previous iterations
        line = partialData + line;
        try {
          JSON.parse(line);
          // at this point, its valid json
          partialData = "";
          beginData = false;
        } catch (err) {
          partialData = line;
        }
        if (partialData === "" && line.length > 0) {
          await attemptPublish(line);
        }
      }
    }
  }, 100);

  return new Promise((resolve, reject) => {
    const req = http.request(url, { signal: controller.signal }, (res) => {
      res.on("data", async (chunk) => {
        let lines = chunk
          .toString()
          .split("\n")
          .filter((l: string) => l.length > 0);
        queue.push(...lines);
      });

      res.on("end", () => {
        resolve("completed");
      });
    });

    req.on("error", (error) => {
      if (error.name === "AbortError") {
        // Ignore abort error. it could be client got disconnected
        resolve("aborted");
      } else {
        reject(error);
      }
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
    console.error("Failed to send chunks to connection id ", connectionId, err);
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
