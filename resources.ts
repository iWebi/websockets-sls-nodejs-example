import * as dynamoresources from "./dynamodbresources";
import * as sqsresources from "./sqsresources";
export default {
  Resources: {
    ...dynamoresources.default,
    ...sqsresources.default,
  },
};
