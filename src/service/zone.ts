import {
	processRequest,
	ZoneArraySchema,
	ZoneSchema,
	TABLE_NAME,
	parseData,
} from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
	DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import {
	CreateZoneRequest,
	UpdateZoneRequest,
	DeleteZoneRequest,
	GetZoneRequest,
	GetZoneListRequest,
	Zone,
} from "../types";

export const ZoneService = (db: DynamoDBDocumentClient) => {
	return {
		async getZone(
			req: GetZoneRequest,
		): Promise<RequestResult<"getZone", Zone>> {
			const get_zone_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: req.payload,
					}),
				);
			const get_zone_result = await processRequest(get_zone_command, "getZone");

			if (get_zone_result.success) {
				const item = get_zone_result.data;
				const parser_result = parseData(item, "getZone", ZoneSchema);
				return parser_result;
			} else {
				return get_zone_result;
			}
		},
		async createZone(
			req: CreateZoneRequest,
		): Promise<RequestResult<"createZone", Zone>> {
			//TODO: Parse it so the item is valid for DB,check UUID generation
			const parsed_data = req.payload;
			const create_zone_command = async () =>
				await db.send(
					new PutCommand({
						TableName: TABLE_NAME,
						Item: parsed_data,
					}),
				);
			const create_zone_result = await processRequest(
				create_zone_command,
				"createZone",
			);
			if (create_zone_result.success) {
				return createRequestSuccess("createZone")(
					parsed_data,
					create_zone_result.code,
					create_zone_result.message,
				);
			} else {
				return create_zone_result;
			}
		},
		async updateZone(
			req: UpdateZoneRequest,
		): Promise<RequestResult<"updateZone", Zone>> {
			const get_zone_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.uuid },
					}),
				);
			const get_zone_result = await processRequest(
				get_zone_command,
				"updateZone",
			);
			if (!get_zone_result.success) {
				return get_zone_result;
			}
			//TODO: Parse it for DB
			const parsed_data = req.payload;
			const update_zone_command = async () =>
				await db.send(
					new PutCommand({
						TableName: TABLE_NAME,
						Item: parsed_data,
					}),
				);
			const update_zone_result = await processRequest(
				update_zone_command,
				"updateZone",
			);
			if (update_zone_result.success) {
				return createRequestSuccess("updateZone")(
					parsed_data,
					update_zone_result.code,
					update_zone_result.message,
				);
			} else {
				return update_zone_result;
			}
		},
		async deleteZone(
			req: DeleteZoneRequest,
		): Promise<RequestResult<"deleteZone", any>> {
			const get_zone_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: req.payload,
					}),
				);
			const get_zone_result = await processRequest(
				get_zone_command,
				"deleteZone",
			);
			if (!get_zone_result.success) {
				return get_zone_result;
			}
			const delete_zone_command = async () =>
				await db.send(
					new DeleteCommand({ TableName: TABLE_NAME, Key: req.payload }),
				);
			const delete_zone_result = await processRequest(
				delete_zone_command,
				"deleteZone",
			);
			return delete_zone_result;
		},
		async getZoneList(
			req: GetZoneListRequest,
		): Promise<RequestResult<"getZoneList", Zone[]>> {
			const get_zone_list_command = async () =>
				await db.send(
					new ScanCommand({
						TableName: TABLE_NAME,
						FilterExpression: "#type = :zone",
						ExpressionAttributeNames: {
							"#type": "type",
						},
						ExpressionAttributeValues: {
							":zone": "zone",
						},
					}),
				);
			const get_zone_list_result = await processRequest(
				get_zone_list_command,
				"getZoneList",
			);
			if (get_zone_list_result.success) {
				const parse_result = parseData(
					get_zone_list_result.data,
					"getZoneList",
					ZoneArraySchema,
				);
				return parse_result;
			} else {
				return get_zone_list_result;
			}
		},
	};
};
