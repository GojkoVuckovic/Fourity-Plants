import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	PutCommand,
	DynamoDBDocumentClient,
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
		if (!event.body) {
			console.error("Missing request body.");
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "Request body is required." }),
			};
		}

		let plantTypeData: PlantType;
		try {
			plantTypeData = JSON.parse(event.body);
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

		if (!plantTypeData.id) {
			console.error("Missing 'id' in plantTypeData.");
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "'id' is a required field for plant_type.",
				}),
			};
		}

		const command = new GetCommand({
			TableName: TABLE_NAME,
			Key: { id: plantTypeData.id },
		});

		const response = await docClient.send(command);
		const plantType = response.Item as PlantType | undefined;

		if (!plantType) {
			console.error(`Plant type with id ${plantTypeData.id} not found.`);
			return {
				statusCode: 404,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: `Plant type with id ${plantTypeData.id} not found.`,
				}),
			};
		} else {
			await docClient.send(
				new PutCommand({
					TableName: TABLE_NAME,
					Item: plantTypeData,
				}),
			);
			return {
				statusCode: 201, // 201 Created
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "Plant type updated successfully!",
					plantType: plantTypeData,
				}),
			};
		}
	} catch (error: any) {
		// Type 'any' for error as it can be various types
		console.error("Error creating plant_type:", error);

		// Return an error response
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Failed to create plant type.",
				error: error.message,
			}),
		};
	}
};
