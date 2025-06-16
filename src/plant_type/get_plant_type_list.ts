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

interface PlantType {
	id: number;
	name: string;
	picture: string;
	waterRequirement: string;
	sunRequirement: string;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME: string =
	process.env.PLANT_TYPE_TABLE_NAME || "YourPlantTypeTableNameHere";

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context,
): Promise<APIGatewayProxyResult> => {
	try {
		const command = new ScanCommand({
			TableName: TABLE_NAME,
		});

		const response = await docClient.send(command);
		const plantTypes: PlantType[] = (response.Items ?? []).map(
			(plantData: any) => {
				return {
					id: plantData.id?.N || "",
					picture: plantData.picture?.S || "",
					name: plantData.name?.S || "",
					sunRequirement: plantData.sunRequirement?.S || "",
					waterRequirement: plantData.waterRequirement?.S || "",
				};
			},
		);

		if (plantTypes.length === 0) {
			console.warn("No plant types found in the database.");
			return {
				statusCode: 404,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "No plant types found." }),
			};
		}

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				plantTypes: plantTypes,
			}),
		};
	} catch (error: any) {
		// --- Error Handling: Log and return error response ---
		console.error("Error during plant type deletion:", error); // More specific error message

		// Return an error response
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Failed to delete plant type.",
				error: error.message || "An unknown error occurred.", // Ensures error message is never null
			}),
		};
	}
};
