import {
	docClient,
	parseData,
	PlantArraySchema,
	PlantSchema,
	processRequest,
	TABLE_NAME,
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
	CreatePlantRequest,
	UpdatePlantRequest,
	DeletePlantRequest,
	GetPlantRequest,
	GetPlantListRequest,
	PlantType,
	Plant,
	Zone,
} from "../types";

export const plantService = (db: DynamoDBDocumentClient) => {
	return {
		async getPlant(
			req: GetPlantRequest,
		): Promise<RequestResult<"getPlant", Plant>> {
			const get_plant_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: req.payload,
					}),
				);
			const get_plant_result = await processRequest(
				get_plant_command,
				"getPlant",
			);

			if (get_plant_result.success) {
				const item = get_plant_result.data;
				const parser_result = parseData(item, "getPlant", PlantSchema);
				return parser_result;
			} else {
				return get_plant_result;
			}
		},
		async createPlant(
			req: CreatePlantRequest,
		): Promise<RequestResult<"createPlant", Plant>> {
			const get_plant_type_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.plant_type_uuid },
					}),
				);
			const get_plant_type_result = await processRequest(
				get_plant_type_command,
				"createPlant",
			);
			if (!get_plant_type_result.success) {
				return get_plant_type_result;
			}
			const get_zone_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.zone_uuid },
					}),
				);
			const get_zone_result = await processRequest(
				get_zone_command,
				"createPlant",
			);
			if (!get_zone_result.success) {
				return get_zone_result;
			}
			//TODO: Parse it so the item is valid for DB,check UUID generation
			const parsed_data = req.payload;
			const create_plant_command = async () =>
				await db.send(
					new PutCommand({
						TableName: TABLE_NAME,
						Item: parsed_data,
					}),
				);
			const create_plant_result = await processRequest(
				create_plant_command,
				"createPlant",
			);
			if (create_plant_result.success) {
				return createRequestSuccess("createPlant")(
					parsed_data,
					create_plant_result.code,
					create_plant_result.message,
				);
			} else {
				return create_plant_result;
			}
		},
		async updatePlant(
			req: UpdatePlantRequest,
		): Promise<RequestResult<"updatePlant", Plant>> {
			const get_plant_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.uuid },
					}),
				);
			const get_plant_result = await processRequest(
				get_plant_command,
				"updatePlant",
			);
			if (!get_plant_result.success) {
				return get_plant_result;
			}
			const get_plant_type_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.plant_type_uuid },
					}),
				);
			const get_plant_type_result = await processRequest(
				get_plant_type_command,
				"updatePlant",
			);
			if (!get_plant_type_result.success) {
				return get_plant_type_result;
			}
			const get_zone_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: { uuid: req.payload.zone_uuid },
					}),
				);
			const get_zone_result = await processRequest(
				get_zone_command,
				"updatePlant",
			);
			if (!get_zone_result.success) {
				return get_zone_result;
			}
			const parsed_data = req.payload;
			const update_plant_command = async () =>
				await db.send(
					new PutCommand({
						TableName: TABLE_NAME,
						Item: parsed_data,
					}),
				);
			const update_plant_result = await processRequest(
				update_plant_command,
				"updatePlant",
			);
			if (update_plant_result.success) {
				return createRequestSuccess("updatePlant")(
					parsed_data,
					update_plant_result.code,
					update_plant_result.message,
				);
			} else {
				return update_plant_result;
			}
		},
		async deletePlant(
			req: DeletePlantRequest,
		): Promise<RequestResult<"deletePlant", any>> {
			const get_plant_command = async () =>
				await db.send(
					new GetCommand({
						TableName: TABLE_NAME,
						Key: req.payload,
					}),
				);
			const get_plant_result = await processRequest(
				get_plant_command,
				"deletePlant",
			);
			if (!get_plant_result.success) {
				return get_plant_result;
			}
			const delete_plant_command = async () =>
				await db.send(
					new DeleteCommand({ TableName: TABLE_NAME, Key: req.payload }),
				);
			const delete_plant_result = await processRequest(
				delete_plant_command,
				"deletePlant",
			);
			return delete_plant_result;
		},
		async getPlantList(
			req: GetPlantListRequest,
		): Promise<RequestResult<"getPlantList", Plant[]>> {
			const get_plant_list_command = async () =>
				await db.send(
					new ScanCommand({
						TableName: TABLE_NAME,
						FilterExpression: "#type = :plantType",
						ExpressionAttributeNames: {
							"#type": "type",
						},
						ExpressionAttributeValues: {
							":plantType": "plant",
						},
					}),
				);
			const get_plant_list_result = await processRequest(
				get_plant_list_command,
				"getPlantList",
			);
			if (get_plant_list_result.success) {
				const parse_result = parseData(
					get_plant_list_result.data,
					"getPlantList",
					PlantArraySchema,
				);
				return parse_result;
			} else {
				return get_plant_list_result;
			}
		},
	};
};
