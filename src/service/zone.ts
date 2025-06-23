import { getFunc, putFunc, docClient } from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestFail, createRequestSuccess } from "../requests";
import {
	CreateZoneRequest,
	UpdateZoneRequest,
	DeleteZoneRequest,
	GetZoneRequest,
	GetZoneListRequest,
	Zone,
} from "../types";

const ZONE_TABLE_NAME: string = process.env.ZONE_TABLE_NAME || "";

export const createZoneRequestFunc = async (req: CreateZoneRequest) => {
	return await putFunc(ZONE_TABLE_NAME, req);
};

export const updateZoneRequestFunc = async (req: UpdateZoneRequest) => {
	try {
		if (!req.payload.id) {
			return createRequestFail(req.command)(
				400,
				"Id is a required field for zone",
			);
		}
		const zone_get_command = new GetCommand({
			TableName: ZONE_TABLE_NAME,
			Key: { id: req.payload.id },
		});
		const zone_response = await docClient.send(zone_get_command);
		const zone = zone_response.Item as Zone | undefined;
		if (!zone) {
			return createRequestFail(req.command)(
				404,
				"Zone with id " + req.payload.id + " not found",
			);
		}
		await docClient.send(
			new PutCommand({
				TableName: ZONE_TABLE_NAME,
				Item: req.payload,
			}),
		);
		return createRequestSuccess(req.command)(
			req.payload,
			201,
			"Zone updated successfully",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

//TODO: Add implementaion of removing zone_id from all plants of this zone
export const deleteZoneRequestFunc = async (req: DeleteZoneRequest) => {
	try {
		const zone_get_command = new GetCommand({
			TableName: ZONE_TABLE_NAME,
			Key: { id: req.payload.id },
		});
		const zone_response = await docClient.send(zone_get_command);
		const zone = zone_response.Item as Zone | undefined;
		if (!zone) {
			return createRequestFail(req.command)(
				404,
				"Zone with id " + req.payload.id + " not found",
			);
		}
		await docClient.send(
			new DeleteCommand({
				TableName: ZONE_TABLE_NAME,
				Key: req.payload,
			}),
		);
		return createRequestSuccess(req.command)(
			req.payload,
			200,
			"Zone deleted successfully",
		);
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};

export const getZoneRequestFunc = async (req: GetZoneRequest) => {
	return await getFunc<Zone>(ZONE_TABLE_NAME, req.payload, req.command);
};

export const getZoneListRequestFunc = async (req: GetZoneListRequest) => {
	try {
		const command = new ScanCommand({
			TableName: ZONE_TABLE_NAME,
		});
		const response = await docClient.send(command);
		const zones: Zone[] = (response.Items ?? []).map((zoneData: any) => {
			return {
				id: zoneData.id?.N || "",
				employees:
					zoneData.employees?.L?.map((employee: any) => employee.S || "") || [],
				name: zoneData.name?.S || "",
			};
		});
		if (zones.length === 0) {
			return createRequestFail(req.command)(404, "No zones found");
		}
		return createRequestSuccess(req.command)(zones, 200, "");
	} catch (error: any) {
		return createRequestFail(req.command)(500, error.message);
	}
};
