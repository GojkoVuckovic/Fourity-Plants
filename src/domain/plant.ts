import { getFunc, putFunc, docClient } from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestFail, createRequestSuccess } from "../requests";
import {
	CreatePlantRequest,
	UpdatePlantRequest,
	DeletePlantRequest,
	GetPlantRequest,
	GetPlantListRequest,
	PlantType,
	Plant,
	Zone,
} from "../types";

const PLANT_TABLE_NAME: string = process.env.PLANT_TABLE_NAME || "";
const PLANT_TYPE_TABLE_NAME: string = process.env.PLANT_TYPE_TABLE_NAME || "";
const ZONE_TABLE_NAME: string = process.env.ZONE_TABLE_NAME || "";

export const createPlantRequestFunc = async (req: CreatePlantRequest) => {
	try {
		const plantTypeResult = await getFunc<PlantType>(
			PLANT_TYPE_TABLE_NAME,
			{
				id: req.payload.plant_type_id,
			},
			req.command,
		);
		if (!plantTypeResult.success) {
			return plantTypeResult;
		}
		if (req.payload.zone_id) {
			const zoneResult = await getFunc<Zone>(
				ZONE_TABLE_NAME,
				{ id: req.payload.zone_id },
				req.command,
			);
			if (!zoneResult.success) {
				return zoneResult;
			}
		}
		return await putFunc(PLANT_TABLE_NAME, req);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

export const updatePlantRequestFunc = async (req: UpdatePlantRequest) => {
	try {
		if (!req.payload.id) {
			return createRequestFail(req.command)(
				400,
				"Id is a required field for plant",
			);
		}
		const plant_get_command = new GetCommand({
			TableName: PLANT_TABLE_NAME,
			Key: { id: req.payload.id },
		});
		const plant_response = await docClient.send(plant_get_command);
		const plant = plant_response.Item as Plant | undefined;
		if (!plant) {
			return createRequestFail(req.command)(
				404,
				"Plant with id " + req.payload.id + " not found",
			);
		}

		const plant_type_get_command = new GetCommand({
			TableName: PLANT_TYPE_TABLE_NAME,
			Key: { id: req.payload.plant_type_id },
		});

		const plant_type_response = await docClient.send(plant_type_get_command);
		const plantType = plant_type_response.Item as PlantType | undefined;
		if (!plantType) {
			return createRequestFail(req.command)(
				404,
				"Plant type with id " + req.payload.plant_type_id + " not found",
			);
		}
		const zone_command = new GetCommand({
			TableName: ZONE_TABLE_NAME,
			Key: { id: req.payload.zone_id },
		});

		const zone_response = await docClient.send(zone_command);
		const Zone = zone_response.Item as Zone | undefined;

		if (!Zone) {
			return createRequestFail(req.command)(
				404,
				"Plant type with id " + req.payload.zone_id + " not found",
			);
		}
		await docClient.send(
			new PutCommand({
				TableName: PLANT_TABLE_NAME,
				Item: req.payload,
			}),
		);
		return createRequestSuccess(req.command)(
			req.payload,
			201,
			"Plant updated successfully",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

export const deletePlantRequestFunc = async (req: DeletePlantRequest) => {
	try {
		const plant_get_command = new GetCommand({
			TableName: PLANT_TABLE_NAME,
			Key: { id: req.payload.id },
		});
		const plant_response = await docClient.send(plant_get_command);
		const plant = plant_response.Item as Plant | undefined;
		if (!plant) {
			return createRequestFail(req.command)(
				404,
				"Plant with id " + req.payload.id + " not found",
			);
		}
		await docClient.send(
			new DeleteCommand({
				TableName: PLANT_TABLE_NAME,
				Key: req.payload,
			}),
		);
		return createRequestSuccess(req.command)(
			req.payload,
			200,
			"Plant deleted successfully",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

export const getPlantRequestFunc = async (req: GetPlantRequest) => {
	return await getFunc<Plant>(PLANT_TABLE_NAME, req.payload, req.command);
};

export const getPlantListRequestFunc = async (req: GetPlantListRequest) => {
	try {
		const command = new ScanCommand({
			TableName: PLANT_TABLE_NAME,
		});
		const response = await docClient.send(command);
		const Plants: Plant[] = (response.Items ?? []).map((PlantData: any) => {
			return {
				id: PlantData.id?.N || "",
				zone_id: PlantData.zone_id?.N || "",
				plant_type_id: PlantData.plant_type_id?.N || "",
				name: PlantData.name?.S || "",
				additionalInfo: PlantData.additionalInfo?.S || "",
			};
		});
		if (Plants.length === 0) {
			return createRequestFail(req.command)(404, "No plants found");
		}
		return createRequestSuccess(req.command)(Plants, 200, "");
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};
