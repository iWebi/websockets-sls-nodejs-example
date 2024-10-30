import { sendNewConnectionIdMessage } from "@libs/sqs";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

exports.handler = async (event: APIGatewayEvent) => {
  const { requestContext } = event;
  const connectionId = requestContext.connectionId;
  const routeKey = requestContext.routeKey;

  if (routeKey === "$connect") {
    // Push the new active connection id to SQS for asynchronous lambda to start pumping data
    await sendNewConnectionIdMessage(connectionId);
    return successProxyResponse();
  }

  if (routeKey === "$disconnect") {
    // Dummy for now. Implement cleanup features, if any
    return successProxyResponse();
  }
};

function successProxyResponse(data?: any, statusCode?: number): APIGatewayProxyResult {
  return {
    body: data ? JSON.stringify(data) : "",
    statusCode: statusCode ?? 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    isBase64Encoded: false,
  };
}
