export default {
  dynamodb: {
    stages: ["local"],
    start: {
      port: 8000,
      inMemory: true,
      migrate: true,
      seed: true,
      // If you are run DynamoDB in docker, you can enable noStart to prevent another instance of DynamoDB
      noStart: true,
    },
  },
  elasticmq: {
    stages: ["local"],
    start: {
      port: 9324,
      // noStart: true,
    },
  },
  "serverless-offline-sqs": {
    autoCreate: true,
    apiVersion: "2012-11-05",
    endpoint: "http://localhost:9324",
    region: "us-west-2", // does not matter
    accessKeyId: "root", // does not matter
    secretAccessKey: "root", // does not matter
    skipCacheInvalidation: false,
  },
};
