import { createRequestFail, RequestResult } from "../requests";
import { GetEmployeeNamesRequest } from "../types";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const employeeService = (db: DynamoDBDocumentClient) => {
  return {
    async getEmployeeNames(
      req: GetEmployeeNamesRequest,
    ): Promise<RequestResult<"getEmployeeNames", string[]>> {
      return createRequestFail(req.command)(500, "NOT YET IMPLEMENTED");
    },
  };
};
