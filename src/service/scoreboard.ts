import {
	docClient,
	TABLE_NAME,
	processRequest,
	parseData,
	plantRecordArraySchema,
} from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
	DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
	createRequestFail,
	createRequestSuccess,
	RequestResult,
} from "../requests";
import { GetScoreboardRequest, PlantRecord } from "../types";

const PLANT_RECORD_TABLE_NAME: string =
	process.env.PLANT_RECORD_TABLE_NAME || "";

export const scoreboardService = (db: DynamoDBDocumentClient) => {
	return {
		async getScoreboard(
			req: GetScoreboardRequest,
		): Promise<
			RequestResult<"getScoreboard", { [employee_name: string]: number }>
		> {
			const get_plant_record_list_command = async () =>
				await db.send(
					new ScanCommand({
						TableName: TABLE_NAME,
						FilterExpression: "#type = :plant_type",
						ExpressionAttributeNames: {
							"#type": "type",
						},
						ExpressionAttributeValues: {
							":plant_type": "plant_record",
						},
					}),
				);
			const get_plant_record_list_result = await processRequest(
				get_plant_record_list_command,
				"getScoreboard",
			);
			if (get_plant_record_list_result.success) {
				const parse_result = parseData(
					get_plant_record_list_result.data,
					"getScoreboard",
					plantRecordArraySchema,
				);
				if (parse_result.success) {
					const plant_records = parse_result.data;
					const scoreboard: { [employee_name: string]: number } = {};
					for (const record of plant_records) {
						if (record.resolved) {
							if (scoreboard[record.employee_name]) {
								scoreboard[record.employee_name]++;
							} else {
								scoreboard[record.employee_name] = 1;
							}
						}
					}
					return createRequestSuccess(req.command)(scoreboard, 200, "");
				} else {
					return parse_result;
				}
			} else {
				return get_plant_record_list_result;
			}
		},
	};
};
