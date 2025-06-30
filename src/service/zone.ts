import {
	processRequest,
	ZoneArraySchema,
	ZoneSchema,
	TABLE_NAME,
	parseData,
	ZoneDTOSchema,
} from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	DynamoDBDocumentClient,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import {
	CreateZoneRequest,
	UpdateZoneRequest,
	DeleteZoneRequest,
	GetZoneRequest,
	GetZoneListRequest,
	Zone,
	CreateZoneDTO,
	ZoneDatabase,
} from "../types";
import { v4 as uuidv4 } from "uuid";
export const ZoneService = (db: DynamoDBDocumentClient) => {
	return {
		async getZone(
			req: GetZoneRequest,
		): Promise<RequestResult<"getZone", Zone>> {
			const get_zone_command = async () => {
				const { Item } = await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: {
							PK: `ZONE#${req.payload.uuid}`,
							uuid: req.payload.uuid,
						},
					}),
				);
				return Item;
			};
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
		): Promise<RequestResult<"createZone", CreateZoneDTO>> {
			const item = req.payload;
			const parser_result = parseData(item, "createZone", ZoneDTOSchema);
			if (parser_result.success) {
				const zone_uuid: string = uuidv4();
				const zone_database: ZoneDatabase = {
					PK: `ZONE#${zone_uuid}`,
					uuid: zone_uuid,
					type: "ZONE",
					name: parser_result.data.data.name,
					employees: parser_result.data.data.employees,
				};
				const create_zone_command = async () =>
					await db.send(
						new PutCommand({
							TableName: TABLE_NAME,
							Item: zone_database,
						}),
					);
				const create_zone_result = await processRequest(
					create_zone_command,
					"createZone",
				);
				if (create_zone_result.success) {
					return createRequestSuccess("createZone")(
						parser_result.data.data,
						create_zone_result.code,
						create_zone_result.message,
					);
				} else {
					return create_zone_result;
				}
			} else {
				return parser_result;
			}
		},
		async updateZone(
			req: UpdateZoneRequest,
		): Promise<RequestResult<"updateZone", Zone>> {
			const get_zone_command = async () => {
				const { Item } = await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: {
							PK: `ZONE#${req.payload.uuid}`,
							uuid: req.payload.uuid,
						},
					}),
				);
				return Item;
			};
			const get_zone_result = await processRequest(
				get_zone_command,
				"updateZone",
			);
			if (!get_zone_result.success) {
				return get_zone_result;
			}
			const item = req.payload;
			const parser_result = parseData(item, "updateZone", ZoneSchema);
			if (parser_result.success) {
				const zone_database: ZoneDatabase = {
					PK: `ZONE#${parser_result.data.uuid}`,
					uuid: parser_result.data.uuid,
					type: "ZONE",
					name: parser_result.data.data.name,
					employees: parser_result.data.data.employees,
				};
				const update_zone_command = async () =>
					await db.send(
						new PutCommand({
							TableName: TABLE_NAME,
							Item: zone_database,
						}),
					);
				const update_zone_result = await processRequest(
					update_zone_command,
					"updateZone",
				);
				if (update_zone_result.success) {
					return createRequestSuccess("updateZone")(
						parser_result.data,
						update_zone_result.code,
						update_zone_result.message,
					);
				} else {
					return update_zone_result;
				}
			} else {
				return parser_result;
			}
		},
		async deleteZone(
			req: DeleteZoneRequest,
		): Promise<RequestResult<"deleteZone", any>> {
			const get_zone_command = async () => {
				const { Item } = await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: {
							PK: `ZONE#${req.payload.uuid}`,
							uuid: req.payload.uuid,
						},
					}),
				);
				return Item;
			};
			const get_zone_result = await processRequest(
				get_zone_command,
				"deleteZone",
			);
			if (!get_zone_result.success) {
				return get_zone_result;
			}
			const delete_zone_command = async () =>
				await db.send(
					new DeleteCommand({
						TableName: TABLE_NAME,
						Key: { PK: `ZONE#${req.payload.uuid}`, uuid: req.payload.uuid },
					}),
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
			const get_zone_list_command = async () => {
				const { Items } = await db.send(
					new QueryCommand({
						TableName: TABLE_NAME,
						IndexName: "TypeIndex",
						KeyConditionExpression: "#typeAttr = :typeValue",
						ExpressionAttributeNames: {
							"#typeAttr": "type",
						},
						ExpressionAttributeValues: {
							":typeValue": { S: "ZONE" },
						},
					}),
				);
				return Items;
			};
			const get_zone_list_result = await processRequest(
				get_zone_list_command,
				"getZoneList",
			);
			if (get_zone_list_result.success) {
				const parse_data = [get_zone_list_result.data];
				const parse_result = parseData(
					parse_data,
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
