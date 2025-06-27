import {
	TABLE_NAME,
	processRequest,
	parseData,
	plantRecordArraySchema,
} from "./utils";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createRequestFail, RequestResult } from "../requests";
import {
	CreateScheduleRequest,
	GetScheduleRequest,
	PlantRecord,
} from "../types";

export const scheduleService = (db: DynamoDBDocumentClient) => {
	return {
		async createSchedule(
			req: CreateScheduleRequest,
		): Promise<RequestResult<"createSchedule", string[]>> {
			return createRequestFail(req.command)(500, "NOT YET IMPLEMENTED");
		},
		async getSchedule(
			req: GetScheduleRequest,
		): Promise<RequestResult<"getSchedule", PlantRecord[]>> {
			const get_plant_record_list_command = async () => {
				const { Items } = await db.send(
					new QueryCommand({
						TableName: TABLE_NAME,
						IndexName: "TypeIndex",
						KeyConditionExpression: "#typeAttr = :typeValue",
						ExpressionAttributeNames: {
							"#typeAttr": "type",
						},
						ExpressionAttributeValues: {
							":typeValue": { S: "PLANT_RECORD" },
						},
					}),
				);
				return Items;
			};
			const get_plant_record_list_result = await processRequest(
				get_plant_record_list_command,
				"getSchedule",
			);
			if (get_plant_record_list_result.success) {
				const parse_data = [get_plant_record_list_result.data];
				const parse_result = parseData(
					parse_data,
					"getSchedule",
					plantRecordArraySchema,
				);
				return parse_result;
			} else {
				return get_plant_record_list_result;
			}
		},
	};
};
