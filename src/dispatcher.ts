import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import {
	LambdaClient,
	InvokeCommand,
	InvocationType,
	LogType,
} from "@aws-sdk/client-lambda";

interface Plant {
	id: number;
	zone_id: number;
	plant_type_id: number;
	name: string;
	additionalInfo?: string;
}

interface PlantType {
	id: number;
	name: string;
	picture: string;
	waterRequirement: string;
	sunRequirement: string;
}

interface Zone {
	id: number;
	employees: string[];
	name: string;
}

interface PlantRequest {
	command: "createPlant" | "updatePlant";
	payload: Plant;
}

interface PlantTypeRequest {
	command: "createPlantType" | "updatePlantType";
	payload: PlantType;
}
interface ZoneRequest {
	command: "createZone" | "updateZone";
	payload: Zone;
}
interface PlantRecordRequest {
	command: "updatePlantRecord";
	payload: { id: number; additionalInfo?: string };
}
interface IDRequest {
	command:
		| "deletePlant"
		| "getPlant"
		| "deletePlantType"
		| "getPlantType"
		| "getZone"
		| "deleteZone";
	payload: { id: number };
}
interface NoPayloadRequest {
	command:
		| "getPlantList"
		| "getPlantTypeList"
		| "getZoneList"
		| "getPlantRecordList"
		| "createSchedule"
		| "getSchedule"
		| "getScoreboard";
	payload?: never;
}

type Req =
	| PlantRequest
	| PlantTypeRequest
	| ZoneRequest
	| PlantRecordRequest
	| IDRequest
	| NoPayloadRequest;

const lambdaClient = new LambdaClient({});

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
		let targetLambdaArn: string | undefined;
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

		if (request.command === "createPlant") {
			targetLambdaArn = process.env.PLANT_CREATE_ARN;
		} else if (request.command === "updatePlant") {
			targetLambdaArn = process.env.PLANT_UPDATE_ARN;
		} else if (request.command === "createPlantType") {
			targetLambdaArn = process.env.PLANT_TYPE_CREATE_ARN;
		} else if (request.command === "updatePlantType") {
			targetLambdaArn = process.env.PLANT_TYPE_UPDATE_ARN;
		} else if (request.command === "createZone") {
			targetLambdaArn = process.env.ZONE_CREATE_ARN;
		} else if (request.command === "updateZone") {
			targetLambdaArn = process.env.ZONE_UPDATE_ARN;
		} else if (request.command === "updatePlantRecord") {
			targetLambdaArn = process.env.PLANT_RECORD_UPDATE_ARN;
		} else if (request.command === "deletePlant") {
			targetLambdaArn = process.env.PLANT_DELETE_ARN;
		} else if (request.command === "getPlant") {
			targetLambdaArn = process.env.PLANT_GET_ARN;
		} else if (request.command === "deletePlantType") {
			targetLambdaArn = process.env.PLANT_TYPE_DELETE_ARN;
		} else if (request.command === "getPlantType") {
			targetLambdaArn = process.env.PLANT_TYPE_GET_ARN;
		} else if (request.command === "getZone") {
			targetLambdaArn = process.env.ZONE_GET_ARN;
		} else if (request.command === "deleteZone") {
			targetLambdaArn = process.env.ZONE_DELETE_ARN;
		} else if (request.command === "getPlantList") {
			targetLambdaArn = process.env.PLANT_LIST_ARN;
		} else if (request.command === "getPlantTypeList") {
			targetLambdaArn = process.env.PLANT_TYPE_LIST_ARN;
		} else if (request.command === "getZoneList") {
			targetLambdaArn = process.env.ZONE_LIST_ARN;
		} else if (request.command === "getPlantRecordList") {
			targetLambdaArn = process.env.PLANT_RECORD_LIST_ARN;
		} else if (request.command === "createSchedule") {
			targetLambdaArn = process.env.SCHEDULE_CREATE_ARN;
		} else if (request.command === "getSchedule") {
			targetLambdaArn = process.env.SCHEDULE_GET_ARN;
		} else if (request.command === "getScoreboard") {
			targetLambdaArn = process.env.SCOREBOARD_GET_ARN;
		} else {
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "Command not found.",
				}),
			};
		}
		const invokeParams = {
			FunctionName: targetLambdaArn,
			InvocationType: InvocationType.RequestResponse,
			Payload: JSON.stringify(request.payload),
		};

		const result = await lambdaClient.send(new InvokeCommand(invokeParams));
		const responsePayload = result.Payload
			? JSON.parse(Buffer.from(result.Payload).toString())
			: {};
		return {
			statusCode: result.StatusCode || 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Request processed successfully.",
				data: responsePayload,
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
	} finally {
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Bilo sta",
			}),
		};
	}
};
