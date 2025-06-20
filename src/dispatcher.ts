import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import { ProcessRequest } from "./domain/index.ts";
import { successResponse, errorResponse } from "./response.ts";
import { createRequestFail, createRequestSuccess } from "./requests";
import { Req } from "./types.ts";

const ResolveRequest = (
	event: APIGatewayProxyEvent,
): [Req | null, null | APIGatewayProxyResult] => {
	if (!event.body) {
		const fail = createRequestFail("body_parse")(
			400,
			"Request body is required",
		);
		return [null, errorResponse(fail)];
	}
	let request: Req;
	try {
		request = JSON.parse(event.body);
	} catch (parseError: any) {
		const fail = createRequestFail("body_parse")(
			400,
			"Invalid JSON in request body",
		);
		return [null, errorResponse(fail)];
	}
	return [request, null];
};

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context,
): Promise<APIGatewayProxyResult> => {
	try {
		const [request, error] = ResolveRequest(event);
		if (request) {
			const result = await ProcessRequest(request);
			if (result.success) {
				const success = createRequestSuccess("result")(
					result.data,
					result.code,
					result.message,
				);
				return successResponse(success);
			} else {
				const error = createRequestFail("result")(result.code, result.message);
				return errorResponse(error);
			}
		} else if (error) {
			return error;
		}
	} catch (error: any) {
		const fail = createRequestFail("")(500, error.message);
		return errorResponse(fail);
	}

	const fail = createRequestFail("unexpected")(500, "Unhandled Request");
	return errorResponse(fail);
};
