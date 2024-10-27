import type { AWS } from "@serverless/typescript";
import functions from "./functions";
import iamRoleStatements from "./iamRoleStatements";
import plugins from "./plugins";
import resources from "./resources";

const serverlessConfiguration: AWS = {
  service: "websockets-sls-nodejs-example-apis",
  frameworkVersion: "3",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: false,
    },
    prune: {
      automatic: true,
      number: 3,
    },
    useDocker: true,
    // offline (local) related
    // ...offlinepluginconfig,
  },
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    region: "us-west-2",
    websocketsApiName: "odds-websockets-api",
    websocketsApiRouteSelectionExpression: "$request.body.action",
    websocketsDescription: "Example WebSockets API to demo odds streaming",

    logRetentionInDays: 14,
    logs: {
      websocket: {
        accessLogging: true,
        executionLogging: true,
        level: "INFO",
        format:
          '{"requestId": "$context.requestId", "userAgent": "$context.identity.userAgent", "ip": "$context.identity.sourceIp", "caller": "$context.identity.caller", "user": "$context.identity.user", "requestTime": "$context.requestTime", "httpMethod": "$context.httpMethod", "resourcePath": "$context.resourcePath", "status": "$context.status", "protocol": "$context.protocol", "responseLength": "$context.responseLength" }',
      },
    },
    environment: {
      ACCOUNT_ID: "${aws:accountId}",
      STAGE: "${opt:stage}",
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    iamRoleStatements,
    tracing: {
      lambda: true,
      apiGateway: true,
    },
  },
  package: {
    individually: true,
  },
  layers: {
    nodejs: {
      name: "nodejs",
      path: "layer",
      description: "API NodeJS dependencies with aws-sdk v3",
      compatibleRuntimes: ["nodejs20.x"],
    },
  },
  plugins,
  resources,
  functions,
};

module.exports = serverlessConfiguration;
