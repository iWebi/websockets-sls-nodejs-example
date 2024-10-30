export enum SQS_NOTIFICATION_TYPE {
  ADD_CONNECTION_ID = "ADD_CONNECTION_ID",
  REMOVE_CONNECTION_ID = "REMOVE_CONNECTION_ID",
}

export interface SqsNotification {
  type: SQS_NOTIFICATION_TYPE;
  data: string;
}
