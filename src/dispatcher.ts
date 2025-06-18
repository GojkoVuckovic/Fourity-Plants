import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	PutCommand,
	DynamoDBDocumentClient,
	GetCommand,
	ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { error } from "console";
import { create } from "domain";

type RequestCommon<OP extends string> = {
	requestId: OP;
	code: number;
	message: string;
};

type RequestFail<OP extends string> = RequestCommon<OP> & {
	success: false;
};

type RequestSuccess<OP extends string, T> = RequestCommon<OP> & {
	success: true;
	data: T;
};

type RequestResult<OP extends string, T> =
	| RequestSuccess<OP, T>
	| RequestFail<OP>;

const createRequestFail =
	<const OP extends string>(requestId: OP) =>
	(code: number, message: string): RequestFail<OP> => ({
		success: false,
		requestId,
		code,
		message,
	});

const createRequestSuccess =
	<const OP extends string>(requestId: OP) =>
	<T extends unknown>(
		data: T,
		code: number,
		message: string,
	): RequestSuccess<OP, T> => ({
		success: true,
		requestId,
		data,
		code,
		message,
	});

type Plant = {
	id: number;
	zone_id: number;
	plant_type_id: number;
	name: string;
	additionalInfo?: string;
};
type PlantType = {
	id: number;
	name: string;
	picture: string;
	waterRequirement: string;
	sunRequirement: string;
};

type Zone = {
	id: number;
	employees: string[];
	name: string;
};

type PlantRecord = {
	id: number;
	plant_id: number;
	employee_name: string;
	isWater: boolean;
	isSun: boolean;
	date: string;
	resolved: boolean;
	additionalInfo?: string;
};

type CreatePlantRequest = {
	command: "createPlant";
	payload: Plant;
};

type UpdatePlantRequest = {
	command: "updatePlant";
	payload: Plant;
};

type DeletePlantRequest = {
	command: "deletePlant";
	payload: { id: number };
};

type GetPlantRequest = {
	command: "getPlant";
	payload: { id: number };
};

type GetPlantListRequest = {
	command: "getPlantList";
	payload?: never;
};

type CreatePlantTypeRequest = {
	command: "createPlantType";
	payload: PlantType;
};

type UpdatePlantTypeRequest = {
	command: "updatePlantType";
	payload: PlantType;
};

type DeletePlantTypeRequest = {
	command: "deletePlantType";
	payload: { id: number };
};

type GetPlantTypeRequest = {
	command: "getPlantType";
	payload: { id: number };
};

type GetPlantTypeListRequest = {
	command: "getPlantTypeList";
	payload?: never;
};

type CreateZoneRequest = {
	command: "createZone";
	payload: Zone;
};

type UpdateZoneRequest = {
	command: "updateZone";
	payload: Zone;
};

type DeleteZoneRequest = {
	command: "deleteZone";
	payload: { id: number };
};

type GetZoneRequest = {
	command: "getZone";
	payload: { id: number };
};

type GetZoneListRequest = {
	command: "getZoneList";
	payload?: never;
};

type UpdatePlantRecordRequest = {
	command: "updatePlantRecord";
	payload: { id: number; additionalInfo?: string };
};

type GetPlantRecordListRequest = {
	command: "getPlantRecordList";
	payload?: never;
};

type CreateScheduleRequest = {
	command: "createSchedule";
	payload?: never;
};

type GetScheduleRequest = {
	command: "getSchedule";
	payload?: never;
};

type GetScoreboardRequest = {
	command: "getScoreboard";
	payload?: never;
};

type GetEmployeeNamesRequest = {
	command: "getEmployeeNames";
	payload: { employeeNames: string[] };
};

type EmployeeRequests = GetEmployeeNamesRequest;

type PlantRequests =
	| CreatePlantRequest
	| UpdatePlantRequest
	| DeletePlantRequest
	| GetPlantRequest
	| GetPlantListRequest;

type PlantRecordRequests = UpdatePlantRecordRequest | GetPlantRecordListRequest;

type PlantTypeRequests =
	| CreatePlantTypeRequest
	| UpdatePlantTypeRequest
	| DeletePlantTypeRequest
	| GetPlantTypeRequest
	| GetPlantTypeListRequest;

type ScheduleRequests = CreateScheduleRequest | GetScheduleRequest;

type ScoreboardRequests = GetScoreboardRequest;

type ZoneRequests =
	| CreateZoneRequest
	| UpdateZoneRequest
	| DeleteZoneRequest
	| GetZoneRequest
	| GetZoneListRequest;

type Req =
	| EmployeeRequests
	| PlantRequests
	| PlantRecordRequests
	| PlantTypeRequests
	| ScheduleRequests
	| ScoreboardRequests
	| ZoneRequests;

const createPlantRequestFunc = async (req: CreatePlantRequest) => {
	return createRequestSuccess("createPlant")(
		{ id: 1 },
		201,
		"Plant created successfully",
	);
};

const updatePlantRequestFunc = async (req: UpdatePlantRequest) => {
	//
};

const deletePlantRequestFunc = async (req: DeletePlantRequest) => {
	//
};

const getPlantRequestFunc = async (req: GetPlantRequest) => {
	//
};

const getPlantListRequestFunc = async (req: GetPlantListRequest) => {
	//
};

const createPlantTypeRequestFunc = async (req: CreatePlantTypeRequest) => {
	//
};

const updatePlantTypeRequestFunc = async (req: UpdatePlantTypeRequest) => {
	//
};

const deletePlantTypeRequestFunc = async (req: DeletePlantTypeRequest) => {
	//
};

const getPlantTypeRequestFunc = async (req: GetPlantTypeRequest) => {
	//
};

const getPlantTypeListRequestFunc = async (req: GetPlantTypeListRequest) => {
	//
};

const createZoneRequestFunc = async (req: CreateZoneRequest) => {
	//
};

const updateZoneRequestFunc = async (req: UpdateZoneRequest) => {
	//
};

const deleteZoneRequestFunc = async (req: DeleteZoneRequest) => {
	//
};

const getZoneRequestFunc = async (req: GetZoneRequest) => {
	//
};

const getZoneListRequestFunc = async (req: GetZoneListRequest) => {
	//
};

const updatePlantRecordRequestFunc = async (req: UpdatePlantRecordRequest) => {
	//
};

const getPlantRecordListRequestFunc = async (
	req: GetPlantRecordListRequest,
) => {
	//
};

const createScheduleRequestFunc = async (req: CreateScheduleRequest) => {
	//
};

const getScheduleRequestFunc = async (req: GetScheduleRequest) => {
	//
};

const getScoreboardRequestFunc = async (req: GetScoreboardRequest) => {
	//
};

const getEmployeeNamesRequestFunc = async (req: GetEmployeeNamesRequest) => {
	//
};

const assertUnreachable =
	<const OP extends string>(requestId: OP) =>
	(code: number, message: string): RequestFail<OP> =>
		createRequestFail(requestId)(code, message);

const processRequest = async (data: Req) => {
	switch (data.command) {
		case "createPlant":
			return createPlantRequestFunc(data);
		case "updatePlant":
			return updatePlantRequestFunc(data);
		case "deletePlant":
			return deletePlantRequestFunc(data);
		case "getPlant":
			return getPlantRequestFunc(data);
		case "getPlantList":
			return getPlantListRequestFunc(data);
		case "createPlantType":
			return createPlantTypeRequestFunc(data);
		case "updatePlantType":
			return updatePlantTypeRequestFunc(data);
		case "deletePlantType":
			return deletePlantTypeRequestFunc(data);
		case "getPlantType":
			return getPlantTypeRequestFunc(data);
		case "getPlantTypeList":
			return getPlantTypeListRequestFunc(data);
		case "createZone":
			return createZoneRequestFunc(data);
		case "updateZone":
			return updateZoneRequestFunc(data);
		case "deleteZone":
			return deleteZoneRequestFunc(data);
		case "getZone":
			return getZoneRequestFunc(data);
		case "getZoneList":
			return getZoneListRequestFunc(data);
		case "updatePlantRecord":
			return updatePlantRecordRequestFunc(data);
		case "getPlantRecordList":
			return getPlantRecordListRequestFunc(data);
		case "createSchedule":
			return createScheduleRequestFunc(data);
		case "getSchedule":
			return getScheduleRequestFunc(data);
		case "getScoreboard":
			return getScoreboardRequestFunc(data);
		case "getEmployeeNames":
			return getEmployeeNamesRequestFunc(data);
		default:
			return assertUnreachable("Unhandled command")(400, `Unhandled command`);
	}
};

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const PLANT_TABLE_NAME: string = process.env.PLANT_TABLE_NAME || "";
const PLANT_TYPE_TABLE_NAME: string = process.env.PLANT_TYPE_TABLE_NAME || "";
const ZONE_TABLE_NAME: string = process.env.ZONE_TABLE_NAME || "";
const PLANT_RECORD_TABLE_NAME: string =
	process.env.PLANT_RECORD_TABLE_NAME || "";

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context,
): Promise<APIGatewayProxyResult> => {
	try {
		if (!event.body) {
			console.error("Missing request body.");
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "Request body is required." }),
			};
		}
		let request: Req;
		try {
			request = JSON.parse(event.body);
		} catch (parseError: any) {
			console.error("Failed to parse request body:", parseError);
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "Invalid JSON in request body.",
				}),
			};
		}

		const result = await processRequest(request);

		return {
			statusCode: result.code,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: result.message,
				...(result.success ? {data:result.data} : {})}),
			};
		}
		catch (error: any) {

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Request processed successfully.",
			}),
		};
	} catch (error: any) {
		console.error("Error creating plant_type:", error);
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Failed.",
				error: error.message,
			}),
		};
	}
};
