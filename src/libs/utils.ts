import { APIGatewayProxyResult } from "aws-lambda";
import { DEFAULT_RESPONSE_HEADERS } from "./constants";
import { AppError, BaseEntity, DynamoItemResponse } from "./types";

export function setStatusType(code: any): string {
  switch (code) {
    case 400:
      return "Bad Request";
    case 401: // intentional UnAuthorized instead of Not Authenticated error
    case 403:
      return "UnAuthorized";
    case 404:
      return "Not Found";
    case 408:
      return "Request Timeout";
    case 500:
      return "Internal Server Error";
    default:
      return "";
  }
}

export function debug(message: string, ...optionalParams: any[]) {
  console.log(`DEBUG: ${message}`, optionalParams);
}

export function hasElement<T>(sourceArray: T[] | undefined, elementToFind: T) {
  if (!sourceArray || sourceArray.length === 0) {
    return;
  }
  return sourceArray.findIndex((s) => s === elementToFind) !== -1;
}

export function badRequestWith(message?: string): AppError {
  return {
    body: message ?? "",
    statusCode: 400,
    statusType: "Bad Request",
  };
}
export function notFoundResponse(message?: string): DynamoItemResponse<string> {
  return {
    body: message ?? "",
    statusCode: 404,
    statusType: setStatusType(404),
  };
}

export function okResponse<T>(data: T): DynamoItemResponse<T> {
  return {
    body: data,
    statusCode: 200,
    statusType: "OK",
  };
}

export function internalServerErrorWith(message?: string): AppError {
  return {
    body: message ?? "",
    statusCode: 500,
    statusType: "Internal Server Error",
  };
}

export function removeDynamoAttributes(entity: Partial<BaseEntity> | Array<Partial<BaseEntity>>) {
  if (!entity) {
    return entity;
  }
  if (Array.isArray(entity)) {
    entity.forEach((e) => {
      if (e.hashKey) {
        delete e.hashKey;
        delete e.rangeKey;
      }
    });
  } else if (entity.hashKey) {
    delete entity.hashKey;
    delete entity.rangeKey;
  }
  return entity;
}

export function successProxyResponse(data?: any, statusCode?: number): APIGatewayProxyResult {
  removeDynamoAttributes(data);
  return {
    body: data ? JSON.stringify(data) : "",
    statusCode: statusCode ?? 200,
    headers: DEFAULT_RESPONSE_HEADERS,
    isBase64Encoded: false,
  };
}

export function isEmpty(value: any): boolean {
  return value === null || value === undefined;
}

export function isNonEmpty(value: any): boolean {
  return !isEmpty(value);
}
