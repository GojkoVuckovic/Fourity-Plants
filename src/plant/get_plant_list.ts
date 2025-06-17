import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
	PutCommand, // Still not used for delete, but kept if you're reusing this file for other operations
	DynamoDBDocumentClient,
	DeleteCommand,
	GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";

interface Plant {
	id: number;
	zone_id: number;
	plant_type_id: number;
	name: string;
	additionalInfo?: string;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const PLANT_TABLE_NAME: string = process.env.PLANT_TABLE_NAME || "";

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context,
): Promise<APIGatewayProxyResult> => {
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
			console.warn("No plants found in the database.");
			return {
				statusCode: 404,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "No Plants found." }),
			};
		}

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				Plants: Plants,
			}),
		};
	} catch (error: any) {
		console.error("Error during Plant deletion:", error);

		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Failed to delete Plant.",
				error: error.message || "An unknown error occurred.",
			}),
		};
	}
};
