import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { ProcessRequest } from "./service/index";
import { successResponse, errorResponse } from "./response";
import { createRequestFail, createRequestSuccess } from "./requests";
import { Req } from "./types";
import { Resource } from "sst";
import crypto from "crypto";

const BodyParseFail = createRequestFail("body_parse");

const verifyRequest = (event: APIGatewayProxyEventV2): boolean => {
  const hmacSecret = Resource.FRONT_SIGNING_SECRET.value;
  if (!hmacSecret || !event.body) return false;

  const headers = Object.fromEntries(
    Object.entries(event.headers).map(([k, v]) => [k.toLowerCase(), v]),
  );
  const signature = headers["x-hmac-signature"];
  if (!signature) return false;

  const computedSignature = crypto
    .createHmac("sha256", hmacSecret)
    .update(event.body)
    .digest("hex");
  return computedSignature === signature;
};

export const ResolveRequest = (
  event: APIGatewayProxyEventV2,
): [Req | null, null | APIGatewayProxyResult] => {
  let request: Req;
  if (!event.body) {
    const fail = BodyParseFail(400, "Request body is required");
    return [null, errorResponse(fail)];
  }
  if (event.requestContext?.http) {
    if (!verifyRequest(event)) {
      const fail = createRequestFail("verification")(
        400,
        "Invalid request signature",
      );
      return [null, errorResponse(fail)];
    }
  }
  try {
    request = JSON.parse(event.body);
  } catch (parseError: any) {
    const fail = BodyParseFail(400, "Invalid JSON in request body");
    return [null, errorResponse(fail)];
  }
  return [request, null];
};

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const [request, error] = ResolveRequest(event);
    if (request) {
      const result = await ProcessRequest(request);
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
  return errorResponse(fail);
};
