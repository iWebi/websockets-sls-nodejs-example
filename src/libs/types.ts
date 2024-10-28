import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue } from "@aws-sdk/lib-dynamodb";

export interface AppError {
  body: string;
  statusCode: number;
  statusType: string;
}

export interface EntityKey {
  hashKey: string;
  rangeKey?: string;
}

export interface BaseEntity extends EntityKey {
  createdEpoch?: number;
  updatedEpoch?: number;
}

export interface DynamoItemResponse<T> {
  body: T;
  statusCode: number;
  statusType: string;
}

export interface DynamoItemsResponse<T> {
  body: T[];
  Count: number;
  LastEvaluatedKey?: Record<string, AttributeValue>;
  statusCode: number;
  statusType: string;
}

export interface ConnectionIdsEntity extends BaseEntity {
  userId?: string; // optional unique user identifier passed by frontend clients
}

export type DynamoLastEvaluatedKey = Record<string, NativeAttributeValue>;
export type PageDirection = "Forward" | "Backward";

export interface PageRequest {
  limit: number;
  ExclusiveStartkey?: DynamoLastEvaluatedKey; //Optional Exclusive StartKey for pagination
  direction?: PageDirection;
}

export interface PagenatedResponse<T> {
  count: number;
  next: string | undefined;
  direction: PageDirection;
  data: T[];
}

export enum SQS_NOTIFICATION_TYPE {
  ADD_CONNECTION_ID = "ADD_CONNECTION_ID",
  REMOVE_CONNECTION_ID = "REMOVE_CONNECTION_ID",
}

export interface SqsNotification {
  type: SQS_NOTIFICATION_TYPE;
  data: string;
}
