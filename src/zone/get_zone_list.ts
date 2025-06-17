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

interface Zone {
	id: number;
	employees: string[];
	name: string;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME: string = process.env.ZONE_TABLE_NAME || "Zone-Table";

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context,
): Promise<APIGatewayProxyResult> => {
	try {
		const command = new ScanCommand({
			TableName: TABLE_NAME,
		});

		const response = await docClient.send(command);
		const Zones: Zone[] = (response.Items ?? []).map((zoneData: any) => {
			return {
				id: zoneData.id?.N || "",
				employees:
					zoneData.employees?.L?.map((employee: any) => employee.S || "") || [],
				name: zoneData.name?.S || "",
			};
		});

		if (Zones.length === 0) {
			console.warn("No zones found in the database.");
			return {
				statusCode: 404,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "No zones found." }),
			};
		}

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				Zones: Zones,
			}),
		};
	} catch (error: any) {
		// --- Error Handling: Log and return error response ---
		console.error("Error during zone deletion:", error); // More specific error message

		// Return an error response
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Failed to delete zone.",
				error: error.message || "An unknown error occurred.", // Ensures error message is never null
			}),
		};
	}
};
