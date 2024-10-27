import { handlerPath } from "@libs/handlerresolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.handler`,
  layers: [{ Ref: "NodejsLambdaLayer" }],
  name: "oddsConnectionsProcessor",
  events: [
    {
      websocket: {
        route: "$connect",
        authorizer: {
          name: "customAuthorizer",
          type: "request",
          identitySource: "route.request.header.authorization",
        },
      },
    },
    {
      websocket: {
        route: "$disconnect",
      },
    },
  ],
};
