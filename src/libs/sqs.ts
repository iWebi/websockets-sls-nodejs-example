import {
  DeleteMessageCommand,
  DeleteMessageCommandInput,
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";

let sqsClient: SQSClient = new SQSClient({ region: process.env.AWS_REGION });

export async function sendNewConnectionIdMessage(connectionId: string) {
  const { STAGE, AWS_REGION, ACCOUNT_ID } = process.env;
  const queueUrl = `https://sqs.${AWS_REGION}.amazonaws.com/${ACCOUNT_ID}/connectionids-${STAGE}.fifo`;
  const sendMessageInput = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({
      type: "ADD_CONNECTION_ID",
      data: connectionId,
    }),
    MessageGroupId: connectionId,
  } as SendMessageCommandInput;
  await sqsClient.send(new SendMessageCommand(sendMessageInput));
}

export async function deleteMessage(receiptHandle: string) {
  const { STAGE, AWS_REGION, ACCOUNT_ID } = process.env;
  const queueUrl = `https://sqs.${AWS_REGION}.amazonaws.com/${ACCOUNT_ID}/connectionids-${STAGE}.fifo`;
  const input = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  } as DeleteMessageCommandInput;
  await sqsClient.send(new DeleteMessageCommand(input));
}
