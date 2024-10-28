import { DeleteItemOutput, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { debug } from "console";
import { DynamoItemResponse } from "./types";
import { internalServerErrorWith, notFoundResponse, okResponse, setStatusType } from "./utils";

const ddbDocClient = buildDocClient();

export async function putItem(params: PutCommandInput): Promise<DynamoItemResponse<any>> {
  try {
    await ddbDocClient.send(new PutCommand(params));
  } catch (err) {
    console.log("Error in talking to dynamo", err);
    throw errorResponse(err);
  }
  return okResponse("");
}

export async function deleteItem(params: any): Promise<DynamoItemResponse<any>> {
  let data: DeleteItemOutput = {};
  try {
    data = await ddbDocClient.send(new DeleteCommand(params));
  } catch (err) {
    throw errorResponse(err);
  }
  if (!data.Attributes) {
    throw404(params);
  }
  return okResponse(data.Attributes!);
}

function errorResponse(err: any) {
  if (err.hasOwnProperty("$metadata")) {
    const code = err.httpStatusCode;
    return {
      body: err.message,
      statusCode: code,
      statusType: setStatusType(code),
    };
  }
  return internalServerErrorWith(JSON.stringify(err));
}

function throw404(params: any, message?: string) {
  debug("Item not found for params", params);
  throw notFoundResponse(message);
}

export function buildDocClient() {
  const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  };

  const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  };

  const dynamodb = new DynamoDBClient({
    region: process.env.AWS_REGION,
  });
  return DynamoDBDocumentClient.from(dynamodb, { marshallOptions, unmarshallOptions });
}
