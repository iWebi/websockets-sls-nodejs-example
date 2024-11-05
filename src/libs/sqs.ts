import {
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";

// let sqsClient: SQSClient = new SQSClient({ region: process.env.AWS_REGION });
let sqsClient: SQSClient;

function buildSQSClient() {
  const { IS_OFFLINE } = process.env;
  const offlineOptions = {
    region: "localhost",
    endpoint: "http://localhost:9324",
  };
  return IS_OFFLINE ? new SQSClient(offlineOptions) : new SQSClient({ region: process.env.AWS_REGION });
}

function getClient(): SQSClient {
  if (!sqsClient) {
    sqsClient = buildSQSClient();
  }
  return sqsClient;
}

export function getConnectionIdsQueueName(): string {
  const { IS_OFFLINE, STAGE, AWS_REGION, ACCOUNT_ID } = process.env;
  return IS_OFFLINE
    ? "http://localhost:9324/queue/connectionids-local.fifo"
    : `https://sqs.${AWS_REGION}.amazonaws.com/${ACCOUNT_ID}/connectionids-${STAGE}.fifo`;
}

export async function sendNewConnectionIdMessage(connectionId: string) {
  const queueUrl = getConnectionIdsQueueName();
  const sendMessageInput = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({
      type: "ADD_CONNECTION_ID",
      data: connectionId,
    }),
    MessageGroupId: connectionId,
  } as SendMessageCommandInput;
  await getClient().send(new SendMessageCommand(sendMessageInput));
}

export async function deleteMessage(receiptHandle: string) {
  const queueUrl = getConnectionIdsQueueName();
  const input = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  } as DeleteMessageCommandInput;
  await getClient().send(new DeleteMessageCommand(input));
}
