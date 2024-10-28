export default {
  // Queue to maintain stream of add/remove connection Ids
  // When a new connection is established, this queue receives ADD_CONNECTION_ID message
  // similarly, it receives REMOVE_CONNECTION_ID message when a client disconnects
  // Listeners of this queue can maintain an inmemory active connections list
  ClientConnectionIdsQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      QueueName: "connectionids-${opt:stage}.fifo",
      FifoQueue: true,
      VisibilityTimeout: 60,
      MessageRetentionPeriod: 180, // 3 minutes to account for lambda cold start
      ContentBasedDeduplication: true,
      ReceiveMessageWaitTimeSeconds: 10,
    },
  },
};
