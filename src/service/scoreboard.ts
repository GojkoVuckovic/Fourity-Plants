import { getFunc, putFunc, docClient } from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestFail, createRequestSuccess } from "../requests";
import { GetScoreboardRequest, PlantRecord } from "../types";

const PLANT_RECORD_TABLE_NAME: string =
	process.env.PLANT_RECORD_TABLE_NAME || "";

export const getScoreboardRequestFunc = async (req: GetScoreboardRequest) => {
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
		const scoreboard: { [employee_name: string]: number } = {};
		for (const record of PlantRecords) {
			if (record.resolved) {
				if (scoreboard[record.employee_name]) {
					scoreboard[record.employee_name]++;
				} else {
					scoreboard[record.employee_name] = 1;
				}
			}
		}
		return createRequestSuccess(req.command)(scoreboard, 200, "");
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};
