import { getFunc, putFunc, docClient } from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestFail, createRequestSuccess } from "../requests";
import {
	CreatePlantTypeRequest,
	UpdatePlantTypeRequest,
	DeletePlantTypeRequest,
	GetPlantTypeRequest,
	GetPlantTypeListRequest,
	PlantType,
} from "../types";
const PLANT_TYPE_TABLE_NAME: string = process.env.PLANT_TYPE_TABLE_NAME || "";

export const createPlantTypeRequestFunc = async (
	req: CreatePlantTypeRequest,
) => {
	return await putFunc(PLANT_TYPE_TABLE_NAME, req);
};

export const updatePlantTypeRequestFunc = async (
	req: UpdatePlantTypeRequest,
) => {
	try {
		if (!req.payload.id) {
			return createRequestFail(req.command)(
				400,
				"Id is a required field for plant type",
			);
		}
		const plant_type_get_command = new GetCommand({
			TableName: PLANT_TYPE_TABLE_NAME,
			Key: { id: req.payload.id },
		});
		const plant_response = await docClient.send(plant_type_get_command);
		const plant_type = plant_response.Item as PlantType | undefined;
		if (!plant_type) {
			return createRequestFail(req.command)(
				404,
				"Plant type with id " + req.payload.id + " not found",
			);
		}
		await docClient.send(
			new PutCommand({
				TableName: PLANT_TYPE_TABLE_NAME,
				Item: req.payload,
			}),
		);
		return createRequestSuccess(req.command)(
			req.payload,
			201,
			"Plant type updated successfully",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

export const deletePlantTypeRequestFunc = async (
	req: DeletePlantTypeRequest,
) => {
	try {
		const plant_get_command = new GetCommand({
			TableName: PLANT_TYPE_TABLE_NAME,
			Key: { id: req.payload.id },
		});
		const plant_response = await docClient.send(plant_get_command);
		const plant_type = plant_response.Item as PlantType | undefined;
		if (!plant_type) {
			return createRequestFail(req.command)(
				404,
				"Plant type with id " + req.payload.id + " not found",
			);
		}
		await docClient.send(
			new DeleteCommand({
				TableName: PLANT_TYPE_TABLE_NAME,
				Key: req.payload,
			}),
		);
		return createRequestSuccess(req.command)(
			req.payload,
			200,
			"Plant type deleted successfully",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

export const getPlantTypeRequestFunc = async (req: GetPlantTypeRequest) => {
	return await getFunc<PlantType>(
		PLANT_TYPE_TABLE_NAME,
		req.payload,
		req.command,
	);
};

export const getPlantTypeListRequestFunc = async (
	req: GetPlantTypeListRequest,
) => {
	try {
		const command = new ScanCommand({
			TableName: PLANT_TYPE_TABLE_NAME,
		});
		const response = await docClient.send(command);
		const plantTypes: PlantType[] = (response.Items ?? []).map(
			(plantTypeData: any) => {
				return {
					id: plantTypeData.id?.N || "",
					picture: plantTypeData.picture?.S || "",
					name: plantTypeData.name?.S || "",
					sunRequirement: plantTypeData.sunRequirement?.S || "",
					waterRequirement: plantTypeData.waterRequirement?.S || "",
				};
			},
		);
		if (plantTypes.length === 0) {
			return createRequestFail(req.command)(404, "No plants found");
		}
		return createRequestSuccess(req.command)(plantTypes, 200, "");
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};
