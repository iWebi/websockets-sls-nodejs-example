export default [
  // For lambda to push odds data to SQS
  {
    Effect: "Allow",
    Action: "sqs:*",
    Resource: ["arn:aws:sqs:${aws:region}:*:odds-*"],
  },
  // Table to maintain incoming Websocket connection Ids and user Ids as needed
  {
    Effect: "Allow",
    Action: ["dynamodb:*"],
    Resource: ["arn:aws:dynamodb:${aws:region}:*:table/ClientConnections"],
  },
];
