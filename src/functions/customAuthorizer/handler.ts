import { authorize } from "@libs/auth";
import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";

exports.handler = async (event: APIGatewayRequestAuthorizerEvent) => {
  return await authorize(event);
};
