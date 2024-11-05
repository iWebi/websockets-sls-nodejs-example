# Websockets Experiment using AWS API Gateway With Serverless Framework

This example offers a secured websockets API using AWS API Gateway. Lambda linked to `$connect` route is secured using a custom authorizer lambda. This authorizer expects `Authorization` header from clients attempting to connect.
It uses a dummy value `_t_o_k_e_n_` for verification purpose. Users can change the logic as needed. For example: authenticate against a JWT provider like Auth0 or Cognito.

Connect will push the connectId to the SQS for downstream applications to push data.

## Usage

### Deployment

In order to deploy the example, you need to run the following:

- AWS IAM User for serverless to deploy. This user should have Full Administrative access to create various resources
- There are many ways to pass credentials to sls deploy. This example assumes you have a profile in `.aws/credentials` with name `websockets-sls-nodejs-example`.

```
...
[websockets-sls-nodejs-example]
aws_access_key_id=AKXXXXXXXXXUW
aws_secret_access_key=3FXXXXXXfdfdxxxxYYXXEf
```

Deploy commands:

```
$ npm run install
$ npm run devdeploy
```

After running deploy, you should see output similar to:

```bash
Deploying websockets-sls-nodejs-example-apis to stage dev (us-west-2)
Warning: API Gateway Execution log group not found, skipping retention policy update
✔ Pruning of functions complete

✔ Service deployed to stack websockets-sls-nodejs-example-apis-dev (51s)

endpoint: wss://xxxxxxxx.execute-api.us-west-2.amazonaws.com/dev
functions:
  customAuthorizer: customAuthorizer (3.6 kB)
  connectionsProcessor: connectionsProcessor (10 kB)
layers:
  nodejs: arn:aws:lambda:us-west-2:12345678:layer:nodejs:1

```

### offline support

[serverless offline plugin configuration](./offlinepluginconfig.ts) includes support for SQS.

To test this repository in serverless offline mode, you need

- Run [ElasticMQ](https://github.com/softwaremill/elasticmq) in local machine. Docker is preferable otion.

```
docker run --name elasticmq -d -p 9324:9324 -p 9325:9325 softwaremill/elasticmq-native
```

- update `STREAMING_API_URL` environment variable in [.env.local](./.env.local) file to refer to valid URL
- Starting offline mode `npm run offline`. You should see output similar to below

```bash

~#npm run offline

> websockets-sls-nodejs-example@1.0.0 offline
> sls offline start --stage local --reloadHandler

ElasticMq Offline - [noStart] options is true. Will not start.
Starting Offline SQS at stage local (us-west-2)

Starting Offline at stage local (us-west-2)

Offline [http for lambda] listening on http://localhost:3002
Function names exposed for local invocation by aws-sdk:
           * customAuthorizer: customAuthorizer
           * connectionsProcessor: connectionsProcessor
           * oddsPublisher: oddsPublisher
Configuring Authorization: connectionsProcessor customAuthorizer
route '$connect (λ: connectionsProcessor)'
route '$disconnect (λ: connectionsProcessor)'
Offline [websocket] listening on ws://localhost:3001
Offline [http for websocket] listening on http://localhost:3001

⠙ [Webpack] Watch service...

```

- Connecting to local websocket should start streaming data

```
# wscat -c ws://localhost:3001 -H 'Authorization: _t_o_k_e_n_'
Connected (press CTRL+C to quit)
< event: connected
retry: 5000
data: ok go
```
