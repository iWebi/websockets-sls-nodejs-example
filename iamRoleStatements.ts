export default [
  // For lambda to push connections data to SQS
  {
    Effect: "Allow",
    Action: "sqs:*",
    Resource: ["arn:aws:sqs:${aws:region}:*:connectionids-*"],
  },
];
