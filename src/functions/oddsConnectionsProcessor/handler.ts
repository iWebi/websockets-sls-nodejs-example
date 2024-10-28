import { registerClient, unregisterClient } from "@libs/oddsrepository";
import { successProxyResponse } from "@libs/utils";
import { APIGatewayEvent } from "aws-lambda";

exports.handler = async (event: APIGatewayEvent) => {
  const { requestContext } = event;
  const connectionId = requestContext.connectionId;
  const routeKey = requestContext.routeKey;

  if (routeKey === "$connect") {
    await registerClient(connectionId);
    return successProxyResponse();
  }

  if (routeKey === "$disconnect") {
    await unregisterClient(connectionId);
    return successProxyResponse();
  }
};
