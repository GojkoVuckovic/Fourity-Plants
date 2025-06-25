import {
	docClient,
	parseData,
	PlantRecordSchema,
	plantRecordArraySchema,
	processRequest,
	TABLE_NAME,
} from "./utils";
import {
	GetCommand,
	PutCommand,
	ScanCommand,
	DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
	createRequestFail,
	createRequestSuccess,
	RequestResult,
} from "../requests";
import {
	UpdatePlantRecordRequest,
	PlantRecord,
	GetPlantRecordListRequest,
} from "../types";
import { uppercase } from "zod/v4";

const PLANT_RECORD_TABLE_NAME: string =
	process.env.PLANT_RECORD_TABLE_NAME || "";

export const plantRecordService = (db: DynamoDBDocumentClient) => {
	return {
		async updatePlantRecord(
			req: UpdatePlantRecordRequest,
		): Promise<RequestResult<"updatePlantRecord", PlantRecord>> {
			const get_plant_record_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.uuid },
					}),
				);
			const get_plant_record_result = await processRequest(
				get_plant_record_command,
				"updatePlantRecord",
			);
			if (!get_plant_record_result.success) {
				return get_plant_record_result;
			} else {
				const plant_record_parse = parseData(
					get_plant_record_result,
					"updatePlantRecord",
					PlantRecordSchema,
				);
				if (plant_record_parse.success) {
					const plant_record = plant_record_parse.data;
					plant_record.resolved = true;
					plant_record.additionalInfo = req.payload.additionalInfo;
					const update_plant_record_command = async () =>
						await db.send(
							new PutCommand({ TableName: TABLE_NAME, Item: plant_record }),
						);
					const update_plant_record_result = await processRequest(
						update_plant_record_command,
						"updatePlantRecord",
					);
					if (update_plant_record_result.success) {
						return createRequestSuccess("updatePlantRecord")(
							plant_record,
							200,
							"updated successfully",
						);
					} else {
						return update_plant_record_result;
					}
				} else {
					return plant_record_parse;
				}
			}
		},
		async getPlantRecordList(
			req: GetPlantRecordListRequest,
		): Promise<RequestResult<"getPlantRecordList", PlantRecord[]>> {
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
				"getPlantRecordList",
			);
			if (get_plant_record_list_result.success) {
				const parse_result = parseData(
					get_plant_record_list_result.data,
					"getPlantRecordList",
					plantRecordArraySchema,
				);
				return parse_result;
			} else {
				return get_plant_record_list_result;
			}
		},
	};
};
