import { getFunc, putFunc, docClient } from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestFail, createRequestSuccess } from "../requests";
import {
	CreateScheduleRequest,
	GetScheduleRequest,
	PlantRecord,
} from "../types";

const PLANT_RECORD_TABLE_NAME: string =
	process.env.PLANT_RECORD_TABLE_NAME || "";

export const createScheduleRequestFunc = async (req: CreateScheduleRequest) => {
	return createRequestFail(req.command)(500, "NOT YET IMPLEMENTED");
};

export const getScheduleRequestFunc = async (req: GetScheduleRequest) => {
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
		return createRequestSuccess(req.command)(
			PlantRecords.filter((record) => record.resolved === false),
			200,
			"",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};
