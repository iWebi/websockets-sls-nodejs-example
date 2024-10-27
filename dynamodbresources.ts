export default {
  DeviceTable: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: "ClientConnections",
      AttributeDefinitions: [
        { AttributeName: "hashKey", AttributeType: "S" },
        { AttributeName: "rangeKey", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "hashKey", KeyType: "HASH" },
        { AttributeName: "rangeKey", KeyType: "RANGE" },
      ],
      BillingMode: "PAY_PER_REQUEST",
    },
  },
};
