export default {
  // Queue to maintain stream of odds and pool of connection Ids
  OddsProcessorQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      QueueName: "odds-processor-${opt:stage}.fifo",
      FifoQueue: true,
      VisibilityTimeout: 60,
      MessageRetentionPeriod: 180, // 3 minutes to account for lambda cold start
      ContentBasedDeduplication: true,
      ReceiveMessageWaitTimeSeconds: 10,
    },
  },
  // Queue to receive connectionIds and payload to send to clients
  OddsPublisherQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      QueueName: "odds-publisher-${opt:stage}",
      VisibilityTimeout: 60,
      MessageRetentionPeriod: 180, // 3 minutes to account for lambda cold start
      ReceiveMessageWaitTimeSeconds: 10,
    },
  },
};
