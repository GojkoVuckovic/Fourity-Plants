import { getFunc, putFunc, docClient } from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestFail, createRequestSuccess } from "../requests";
import {
	UpdatePlantRecordRequest,
	PlantRecord,
	GetPlantRecordListRequest,
} from "../types";

const PLANT_RECORD_TABLE_NAME: string =
	process.env.PLANT_RECORD_TABLE_NAME || "";

export const updatePlantRecordRequestFunc = async (
	req: UpdatePlantRecordRequest,
) => {
	try {
		if (!req.payload.id) {
			return createRequestFail(req.command)(
				400,
				"Id is a required field for zone",
			);
		}
		const get_command = new GetCommand({
			TableName: PLANT_RECORD_TABLE_NAME,
			Key: { id: req.payload.id },
		});
		const response = await docClient.send(get_command);
		const plant_record = response.Item as PlantRecord | undefined;
		if (!plant_record) {
			return createRequestFail(req.command)(
				404,
				"Plant record with id " + req.payload.id + " not found",
			);
		}
		plant_record.resolved = true;
		plant_record.additionalInfo = req.payload.additionalInfo;
		await docClient.send(
			new PutCommand({
				TableName: PLANT_RECORD_TABLE_NAME,
				Item: plant_record,
			}),
		);
		return createRequestSuccess(req.command)(
			req.payload,
			201,
			"Plant record updated successfully",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

export const getPlantRecordListRequestFunc = async (
	req: GetPlantRecordListRequest,
) => {
	try {
		const command = new ScanCommand({
			TableName: PLANT_RECORD_TABLE_NAME,
		});
		const response = await docClient.send(command);
		const PlantRecords: PlantRecord[] = (response.Items ?? []).map(
			(PlantData: any) => {
				return {
					id: PlantData.id?.N || "",
					plant_id: PlantData.plant_id?.N || "",
					employee_name: PlantData.employee_name?.S || "",
					isWater: PlantData.isWater?.B || "",
					isSun: PlantData.isSun?.B || "",
					date: PlantData.date?.S || "",
					resolved: PlantData.resolved?.B || "",
					additionalInfo: PlantData.additionalInfo?.S || "",
				};
			},
		);
		return createRequestSuccess(req.command)(PlantRecords, 200, "");
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};
