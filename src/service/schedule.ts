import {
	TABLE_NAME,
	processRequest,
	parseData,
	plantRecordArraySchema,
} from "./utils";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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
			const get_plant_record_list_command = async () =>
				await db.send(
					new ScanCommand({
						TableName: TABLE_NAME,
						FilterExpression:
							"#type = :plant_type and #resolved = :resolved_val",
						ExpressionAttributeNames: {
							"#type": "type",
							"#resolved": "resolved",
						},
						ExpressionAttributeValues: {
							":plant_type": "plant_record",
							":resolved_val": false,
						},
					}),
				);
			const get_plant_record_list_result = await processRequest(
				get_plant_record_list_command,
				"getSchedule",
			);
			if (get_plant_record_list_result.success) {
				const parse_result = parseData(
					get_plant_record_list_result.data,
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
