import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	PutCommand,
	DynamoDBDocumentClient,
	GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
	createRequestFail,
	createRequestSuccess,
	RequestFail,
} from "../requests";
import { Req } from "../types";

export const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

export const getFunc = async <T extends unknown>(
	tableName: string,
	data: { id: number },
	com: string,
) => {
	try {
		const command = new GetCommand({
			TableName: tableName,
			Key: data,
		});

		const response = await docClient.send(command);
		const item = response.Item as T | undefined;
		if (!item) {
			return createRequestFail(com)(404, "Not found");
		}
		return createRequestSuccess(com)(item, 200, "");
	} catch (error: any) {
		return createRequestFail(com)(500, error.message);
	}
};

export const putFunc = async (tableName: string, data: Req) => {
	try {
		await docClient.send(
			new PutCommand({
				TableName: tableName,
				Item: data.payload,
			}),
		);
		return createRequestSuccess(data.command)(
			data.payload,
			201,
			"Data put successfully",
		);
	} catch (error: any) {
		return createRequestFail(data.command)(500, error.message);
	}
};

export const assertUnreachable =
	<const OP extends string>(requestId: OP) =>
	(code: number, message: string): RequestFail<OP> =>
		createRequestFail(requestId)(code, message);
