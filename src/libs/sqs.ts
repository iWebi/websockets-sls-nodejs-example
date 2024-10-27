import { SendMessageCommand, SendMessageCommandInput, SQSClient } from "@aws-sdk/client-sqs";
import * as AWSXRay from "aws-xray-sdk";

let sqsClient: SQSClient;
function buildSQSClient() {
  return AWSXRay.captureAWSv3Client(new SQSClient({ region: process.env.AWS_REGION }) as any) as SQSClient;
}

function getClient(): SQSClient {
  if (!sqsClient) {
    sqsClient = buildSQSClient();
  }
  return sqsClient;
}

function getOddsProcessorQueueName(): string {
  const { STAGE, AWS_REGION, ACCOUNT_ID } = process.env;
  return `https://sqs.${AWS_REGION}.amazonaws.com/${ACCOUNT_ID}/odds-processor-${STAGE}.fifo`;
}

function getProcessorMessageGroupId() {
  // Using the same message group Id for all messages in this Queue to limit max
  // 1 lambda instance for all these messages. Limiting to max 1 concurrent lambda invocation
  // helps us read odds api stream data once per all connected clients and push data to them
  // However, this will not scale well. If streams API has 1000s of odds to process 1 lambda will not scale
  // For such cases, consider to shard messages. I.e Group them like "FootballOdds", "CricketOdds" etc
  // AWS runs 1 lambda per Message group Id. This help you to scale per sport type
  return "OddsProcessor";
}

export async function sendNewConnectionIdMessage(connectionId: string) {
  const sendMessageInput = {
    QueueUrl: getOddsProcessorQueueName(),
    MessageBody: JSON.stringify({
      type: "ADD_CONNECTION_ID",
      data: connectionId,
    }),
    MessageGroupId: getProcessorMessageGroupId(),
  } as SendMessageCommandInput;
  await getClient().send(new SendMessageCommand(sendMessageInput));
}

export async function sendRemoveConnectionIdMessage(connectionId: string) {
  const sendMessageInput = {
    QueueUrl: getOddsProcessorQueueName(),
    MessageBody: JSON.stringify({
      type: "REMOVE_CONNECTION_ID",
      data: connectionId,
    }),
    MessageGroupId: getProcessorMessageGroupId(),
  } as SendMessageCommandInput;
  await getClient().send(new SendMessageCommand(sendMessageInput));
}

export async function sendOddsMessage(message: string, connectionIds: string[]) {
  const { STAGE, AWS_REGION, ACCOUNT_ID } = process.env;
  const queueUrl = `https://sqs.${AWS_REGION}.amazonaws.com/${ACCOUNT_ID}/odds-publisher-${STAGE}.fifo`;

  const sendMessageInput = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({
      type: "SEND_ODDS_TO_USERS",
      data: JSON.stringify({ message, connectionIds }),
    }),
  } as SendMessageCommandInput;
  await getClient().send(new SendMessageCommand(sendMessageInput));
}
