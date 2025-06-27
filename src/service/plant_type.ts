import {
	TABLE_NAME,
	processRequest,
	parseData,
	PlantTypeSchema,
	PlantTypeArraySchema,
	PlantTypeDTOSchema,
} from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	DynamoDBDocumentClient,
	QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
	createRequestFail,
	createRequestSuccess,
	RequestResult,
} from "../requests";
import {
	CreatePlantTypeRequest,
	UpdatePlantTypeRequest,
	DeletePlantTypeRequest,
	GetPlantTypeRequest,
	GetPlantTypeListRequest,
	PlantType,
	CreatePlantTypeDTO,
	PlantTypeDatabase,
} from "../types";
import { v4 as uuidv4 } from "uuid";

export const plantTypeService = (db: DynamoDBDocumentClient) => {
	return {
		async getPlantType(
			req: GetPlantTypeRequest,
		): Promise<RequestResult<"getPlantType", PlantType>> {
			const get_plant_type_command = async () => {
				const { Item } = await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: {
							PK: `PLANT_TYPE#${req.payload.uuid}`,
							uuid: req.payload.uuid,
						},
					}),
				);
				return Item;
			};

			const get_plant_type_result = await processRequest(
				get_plant_type_command,
				"getPlantType",
			);

			if (get_plant_type_result.success) {
				const item = get_plant_type_result.data;
				const parser_result = parseData(item, "getPlantType", PlantTypeSchema);
				return parser_result;
			} else {
				return get_plant_type_result;
			}
		},
		async createPlantType(
			req: CreatePlantTypeRequest,
		): Promise<RequestResult<"createPlantType", CreatePlantTypeDTO>> {
			const item = req.payload;
			const parser_result = parseData(
				item,
				"createPlantType",
				PlantTypeDTOSchema,
			);
			if (parser_result.success) {
				const plant_type_uuid: string = uuidv4();
				const plant_type_database: PlantTypeDatabase = {
					PK: `PLANT_TYPE#${plant_type_uuid}`,
					uuid: plant_type_uuid,
					type: "PLANT_TYPE",
					name: parser_result.data.name,
					picture: parser_result.data.picture,
					waterRequirement: parser_result.data.waterRequirement,
					sunRequirement: parser_result.data.sunRequirement,
				};
				const create_plant_type_command = async () =>
					await db.send(
						new PutCommand({
							TableName: TABLE_NAME,
							Item: plant_type_database,
						}),
					);
				const create_plant_type_result = await processRequest(
					create_plant_type_command,
					"createPlantType",
				);
				if (create_plant_type_result.success) {
					return createRequestSuccess("createPlantType")(
						parser_result.data,
						create_plant_type_result.code,
						create_plant_type_result.message,
					);
				} else {
					return create_plant_type_result;
				}
			} else {
				return parser_result;
			}
		},
		async updatePlantType(
			req: UpdatePlantTypeRequest,
		): Promise<RequestResult<"updatePlantType", PlantType>> {
			const get_plant_type_command = async () => {
				const { Item } = await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: {
							PK: `PLANT_TYPE#${req.payload.uuid}`,
							uuid: req.payload.uuid,
						},
					}),
				);
				return Item;
			};
			const get_plant_type_result = await processRequest(
				get_plant_type_command,
				"updatePlantType",
			);
			if (!get_plant_type_result.success) {
				return get_plant_type_result;
			}
			const item = req.payload;
			const parser_result = parseData(item, "updatePlantType", PlantTypeSchema);
			if (parser_result.success) {
				const plant_type_database: PlantTypeDatabase = {
					PK: `PLANT_TYPE#${parser_result.data.uuid}`,
					uuid: parser_result.data.uuid,
					type: "PLANT_TYPE",
					name: parser_result.data.name,
					picture: parser_result.data.picture,
					waterRequirement: parser_result.data.waterRequirement,
					sunRequirement: parser_result.data.sunRequirement,
				};
				const update_plant_type_command = async () =>
					await db.send(
						new PutCommand({
							TableName: TABLE_NAME,
							Item: plant_type_database,
						}),
					);
				const update_plant_type_result = await processRequest(
					update_plant_type_command,
					"updatePlantType",
				);
				if (update_plant_type_result.success) {
					return createRequestSuccess("updatePlantType")(
						parser_result.data,
						update_plant_type_result.code,
						update_plant_type_result.message,
					);
				} else {
					return update_plant_type_result;
				}
			} else {
				return parser_result;
			}
		},
		async deletePlantType(
			req: DeletePlantTypeRequest,
		): Promise<RequestResult<"deletePlantType", any>> {
			const get_plant_type_command = async () => {
				const { Item } = await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: {
							PK: `PLANT_TYPE#${req.payload.uuid}`,
							uuid: req.payload.uuid,
						},
					}),
				);
				return Item;
			};
			const get_plant_type_result = await processRequest(
				get_plant_type_command,
				"deletePlantType",
			);
			if (!get_plant_type_result.success) {
				return get_plant_type_result;
			}
			const delete_plant_type_command = async () =>
				await db.send(
					new DeleteCommand({
						TableName: TABLE_NAME,
						Key: {
							PK: `PLANT_TYPE#${req.payload.uuid}`,
							uuid: req.payload.uuid,
						},
					}),
				);
			const delete_plant_type_result = await processRequest(
				delete_plant_type_command,
				"deletePlantType",
			);
			return delete_plant_type_result;
		},
		async getPlantTypeList(
			req: GetPlantTypeListRequest,
		): Promise<RequestResult<"getPlantTypeList", PlantType[]>> {
			const get_plant_type_list_command = async () => {
				const { Items } = await db.send(
					new QueryCommand({
						TableName: TABLE_NAME,
						IndexName: "TypeIndex",
						KeyConditionExpression: "#typeAttr = :typeValue",
						ExpressionAttributeNames: {
							"#typeAttr": "type",
						},
						ExpressionAttributeValues: {
							":typeValue": { S: "PLANT_TYPE" },
						},
					}),
				);
				return Items;
			};
			const get_plant_type_list_result = await processRequest(
				get_plant_type_list_command,
				"getPlantTypeList",
			);
			if (get_plant_type_list_result.success) {
				try {
					const parse_data = [get_plant_type_list_result.data];
					const parse_result = parseData(
						parse_data,
						"getPlantTypeList",
						PlantTypeArraySchema,
					);
					return parse_result;
				} catch (error: any) {
					return createRequestFail("getPlantTypeList")(
						404,
						"Error is here bitches",
					);
				}
			} else {
				return get_plant_type_list_result;
			}
		},
	};
};
