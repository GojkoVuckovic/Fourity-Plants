import { APIGatewayProxyResult } from "aws-lambda";
import { RequestSuccess, RequestFail } from "./requests";

export const successResponse = <OP extends string, T>(
	successResult: RequestSuccess<OP, T>,
	statusCode: number = 200,
): APIGatewayProxyResult => {
	return {
		statusCode: statusCode,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			data: successResult.data,
		}),
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
