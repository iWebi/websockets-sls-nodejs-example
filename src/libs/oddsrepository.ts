import { DeleteCommandInput, PutCommandInput, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { deleteItem, getItems, putItem } from "./dynamodb";
import { sendNewConnectionIdMessage, sendRemoveConnectionIdMessage } from "./sqs";
import { AppError, ConnectionIdsEntity, PageRequest } from "./types";
import { isAppError, isEmpty, okResponse } from "./utils";

const CONNECTIONS_TABLE = "ClientConnections";
export const MAX_DYNAMODB_PAGELENGTH = 6000; // Either 6000 records OR max 1MB worth of records in each READ call
export const DEFAULT_PAGE_SIZE = 500;

// TODO: Instead of generalizing hashkey to a constant, prefer hash key for each Sport Type
// Example: FootBallActiveConnections Or you could also further narrow down to Sport+League or any other unique combination
// This makes the partition smaller and easy (less costly) to fetch all connections pertaining to specific hash key
const ACTIVE_CONNECTIONS_HASH_KEY = "ActiveConnections";

// When a new client comes to dashboard, we persist connectionId for later data push
export async function registerClient(connectionId: string) {
  // To maintain a list of Active ConnectionIds we need an in-memory resource like Redis
  // or in-memory cache.

  // For our usecase, DynamoDB is opted
  const entity: ConnectionIdsEntity = {
    hashKey: ACTIVE_CONNECTIONS_HASH_KEY,
    rangeKey: connectionId,
  };
  const params = {
    Item: entity,
    TableName: CONNECTIONS_TABLE,
  } as PutCommandInput;
  await putItem(params);
  // also notify lambda that processes odds to stream to users. Lambda will add this ID to cached set of Ids
  await sendNewConnectionIdMessage(connectionId);
  return okResponse(entity);
}

export async function unregisterClient(connectionId: string) {
  const params = {
    Key: {
      hashKey: ACTIVE_CONNECTIONS_HASH_KEY,
      rangeKey: connectionId,
    },
    TableName: CONNECTIONS_TABLE,
    ReturnValues: "ALL_OLD",
  } as DeleteCommandInput;
  const deleteResponse = await deleteItem(params);
  // also notify lambda that processes odds to stream to users. Lambda will remove this ID from cached set of Ids
  await sendRemoveConnectionIdMessage(connectionId);
  return deleteResponse;
}

export async function getAllActiveConnectionIds(): Promise<string[]> {
  // iterate over ACTIVE_CONNECTIONS_HASH_KEY to fetch all connections available
  // This method is costly. It will be called by SQS events processing lambda once per each cold start
  return await getAllItemsByHashKey<string>(ACTIVE_CONNECTIONS_HASH_KEY, CONNECTIONS_TABLE);
}

export async function getAllItemsByHashKey<T>(hashKey: string, tableName: string) {
  const data: T[] = [];
  const pageRequest: PageRequest = { limit: MAX_DYNAMODB_PAGELENGTH } as PageRequest;

  while (true) {
    try {
      const params = {
        KeyConditionExpression: "hashKey = :hashKey",
        ExpressionAttributeValues: {
          ":hashKey": hashKey,
        },
        TableName: tableName,
      } as QueryCommandInput;
      addPageParams(params, pageRequest);
      const response = await getItems(params);
      data.push(...response.body);
      if (isEmpty(response.LastEvaluatedKey)) {
        break;
      }
      pageRequest.ExclusiveStartkey = response.LastEvaluatedKey;
    } catch (error) {
      if (isAppError(error) && (error as AppError).statusCode === 404) {
        // ignore no data scenario
        break;
      }
      // all other errors, rethrow
      throw error;
    }
    return data;
  }
}

export function addPageParams(params: QueryCommandInput, pageRequest?: PageRequest) {
  if (!pageRequest) {
    return;
  }
  if (pageRequest.ExclusiveStartkey) {
    params.ExclusiveStartKey = pageRequest.ExclusiveStartkey;
  }
  if (pageRequest.direction === "Backward") {
    params.ScanIndexForward = false;
  }
  params.Limit = pageRequest.limit ?? DEFAULT_PAGE_SIZE;
}

export async function fetchUpdatesToClients() {}
