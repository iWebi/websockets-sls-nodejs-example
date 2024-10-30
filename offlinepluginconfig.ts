export default {
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
