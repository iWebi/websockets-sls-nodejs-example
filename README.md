# Websockets Experiment using AWS API Gateway With Serverless Framework

This example offers a secured websockets API using AWS API Gateway. Connected client Ids are stored in DynamoDB for downstream applications to push messages. Lambda linked to `$connect` route is secured using a custom authorizer lambda. This authorizer expects `Authorization` header from clients attempting to connect.
It uses a dummy value `_t_o_k_e_n_` for verification purpose. Users can change the logic as needed. For example: authenticate against a JWT provider like Auth0 or Cognito.

Connect will persist ID and disconnect will remove it. Beyond this no additional data is stored in DB.
To keep it simple, uses a static `ActiveConnections` string as HashKey.

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
