import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { processSlackRequest } from "./service/index";
import { successResponse, errorResponse } from "./response";
import { createRequestFail, createRequestSuccess } from "./requests";

const BodyParseFail = createRequestFail("body_parse");
const ResolveRequest = (
  event: APIGatewayProxyEvent,
): [any | null, null | APIGatewayProxyResult] => {
  if (!event.body) {
    const fail = BodyParseFail(400, "Request body is required");
    return [null, errorResponse(fail)];
  }
  try {
    const decodedBody = Buffer.from(event.body, "base64").toString("utf-8");
    const params = new URLSearchParams(decodedBody);
    const request = params.get("payload");
    if (!request) {
      const command = params.get("command");
      if (!command) {
        const fail = BodyParseFail(400, "Missing payload or command in body");
        return [null, errorResponse(fail, 400)];
      }
      return [command, null];
    }
    const parsedRequest = JSON.parse(request);
    return [parsedRequest, null];
  } catch (parseError: any) {
    const fail = BodyParseFail(400, "Invalid JSON in request body");
    return [null, errorResponse(fail, 400)];
  }
};
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const [request, error] = ResolveRequest(event);
    if (request) {
      const result = await processSlackRequest(request);
      if (result.success) {
        const success = createRequestSuccess("process_request")(
          result.data,
          result.code,
          result.message,
        );
        return successResponse(success);
      } else {
        const error = createRequestFail("process_request")(
          result.code,
          result.message,
        );
        return errorResponse(error);
      }
    } else if (error) {
      return error;
    }
  } catch (error: any) {
    const fail = createRequestFail("process_request")(500, error.message);
    return errorResponse(fail);
  }

  const fail = createRequestFail("process_request")(500, "Unhandled Request");
  return errorResponse(fail, 300);
};
