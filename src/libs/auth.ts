import { APIGatewayProxyEventHeaders, APIGatewayRequestAuthorizerEvent } from "aws-lambda";

export async function authorize(event: APIGatewayRequestAuthorizerEvent) {
  const authToken = findHeader("Authorization", event.headers);
  // TODO: add custom auth logic here such as JWT validation against Cognito
  // dummy logic for demo purpose
  console.log("attempting to authorize using token", event);
  if (authToken === "_t_o_k_e_n_") {
    return generatePolicy(event.methodArn);
  }
  // all other scenarios, invalid
  throw new Error("Unauthorized");
}

export function findHeader(headerName: string, headers: APIGatewayProxyEventHeaders): string | undefined {
  headerName = headerName?.toLocaleLowerCase();
  for (const property of Object.keys(headers)) {
    if (property.toLocaleLowerCase() === headerName) {
      return headers[property];
    }
  }
  return undefined;
}

export function generatePolicy(methodArn: string) {
  const policy = {
    principalId: "fooUser",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: [methodArn],
        },
      ],
    },
  };
  console.log("policy to return is ", JSON.stringify(policy, null, 2));
  return policy;
}
