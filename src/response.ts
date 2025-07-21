import { APIGatewayProxyResult } from "aws-lambda";
import { RequestSuccess, RequestFail } from "./requests";

export const successResponse = <OP extends string, T>(
  successResult: RequestSuccess<OP, T>,
  statusCode: number = 200,
): APIGatewayProxyResult => {
  const isEmpty =
    successResult.data === null ||
    successResult.data === undefined ||
    successResult.data === "" ||
    (typeof successResult.data === "object" &&
      Object.keys(successResult.data).length === 0);

  console.log("isEmpty:", isEmpty);

  const body = isEmpty
    ? ""
    : JSON.stringify({
        data: successResult.data,
      });

  console.log("response body:", body);

  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json" },
    body: body,
  };
};

export const errorResponse = <OP extends string>(
  failResult: RequestFail<OP>,
  statusCode: number = 500,
): APIGatewayProxyResult => {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: {
        code: failResult.code,
        message: failResult.message,
        requestName: failResult.requestName,
      },
    }),
  };
};
