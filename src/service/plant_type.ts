import {
	docClient,
	TABLE_NAME,
	processRequest,
	parseData,
	PlantTypeSchema,
	PlantTypeArraySchema,
} from "./utils";
import {
	GetCommand,
	PutCommand,
	DeleteCommand,
	ScanCommand,
	DynamoDBDocumentClient,
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
} from "../types";
const PLANT_TYPE_TABLE_NAME: string = process.env.PLANT_TYPE_TABLE_NAME || "";

export const plantTypeService = (db: DynamoDBDocumentClient) => {
	return {
		async getPlantType(
			req: GetPlantTypeRequest,
		): Promise<RequestResult<"getPlantType", PlantType>> {
			const get_plant_type_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: req.payload,
					}),
				);
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
		): Promise<RequestResult<"createPlantType", PlantType>> {
			//TODO: Parse it so the item is valid for DB,check UUID generation
			const parsed_data = req.payload;
			const create_plant_type_command = async () =>
				await db.send(
					new PutCommand({
						TableName: TABLE_NAME,
						Item: parsed_data,
					}),
				);
			const create_plant_type_result = await processRequest(
				create_plant_type_command,
				"createPlantType",
			);
			if (create_plant_type_result.success) {
				return createRequestSuccess("createPlantType")(
					parsed_data,
					create_plant_type_result.code,
					create_plant_type_result.message,
				);
			} else {
				return create_plant_type_result;
			}
		},
		async updatePlantType(
			req: UpdatePlantTypeRequest,
		): Promise<RequestResult<"updatePlantType", PlantType>> {
			const get_plant_type_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.uuid },
					}),
				);
			const get_plant_type_result = await processRequest(
				get_plant_type_command,
				"updatePlantType",
			);
			if (!get_plant_type_result.success) {
				return get_plant_type_result;
			}
			//TODO: Parse it for DB
			const parsed_data = req.payload;
			const update_plant_type_command = async () =>
				await db.send(
					new PutCommand({
						TableName: TABLE_NAME,
						Item: parsed_data,
					}),
				);
			const update_plant_type_result = await processRequest(
				update_plant_type_command,
				"updatePlantType",
			);
			if (update_plant_type_result.success) {
				return createRequestSuccess("updatePlantType")(
					parsed_data,
					update_plant_type_result.code,
					update_plant_type_result.message,
				);
			} else {
				return update_plant_type_result;
			}
		},
		async deletePlantType(
			req: DeletePlantTypeRequest,
		): Promise<RequestResult<"deletePlantType", any>> {
			const get_plant_type_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: req.payload,
					}),
				);
			const get_plant_type_result = await processRequest(
				get_plant_type_command,
				"deletePlantType",
			);
			if (!get_plant_type_result.success) {
				return get_plant_type_result;
			}
			const delete_plant_type_command = async () =>
				await db.send(
					new DeleteCommand({ TableName: TABLE_NAME, Key: req.payload }),
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
			const get_plant_type_list_command = async () =>
				await db.send(
					new ScanCommand({
						TableName: TABLE_NAME,
						FilterExpression: "#type = :plant_type",
						ExpressionAttributeNames: {
							"#type": "type",
						},
						ExpressionAttributeValues: {
							":plant_type": "plant_type",
						},
					}),
				);
			const get_plant_type_list_result = await processRequest(
				get_plant_type_list_command,
				"getPlantTypeList",
			);
			if (get_plant_type_list_result.success) {
				const parse_result = parseData(
					get_plant_type_list_result.data,
					"getPlantTypeList",
					PlantTypeArraySchema,
				);
				return parse_result;
			} else {
				return get_plant_type_list_result;
			}
		},
	};
};
