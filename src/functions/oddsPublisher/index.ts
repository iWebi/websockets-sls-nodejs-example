import { handlerPath } from "@libs/handlerresolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  layers: [{ Ref: "NodejsLambdaLayer" }],
  name: "oddsPublisher",
  timeout: 1 * 60, // default is 6 seconds. We want this lambda to run max time to keep streaming to active connections
  events: [
    {
      sqs: {
        arn: { "Fn::GetAtt": ["ClientConnectionIdsQueue", "Arn"] },
      },
    },
  ],
};
