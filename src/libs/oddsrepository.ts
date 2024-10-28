import { DeleteCommandInput, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { deleteItem, putItem } from "./dynamodb";
import { sendNewConnectionIdMessage, sendRemoveConnectionIdMessage } from "./sqs";
import { ConnectionIdsEntity } from "./types";
import { okResponse } from "./utils";

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
  // push this new Ids to the Queue for downstream applications to maintain active connections list
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
  // push this removed Id to the Queue for downstream applications to update active connections list
  await sendRemoveConnectionIdMessage(connectionId);
  return deleteResponse;
}
