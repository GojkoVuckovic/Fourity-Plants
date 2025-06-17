import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
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
		if (!event.body) {
			console.error("Missing request body.");
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "Request body is required." }),
			};
		}

		let parsedBody: { id?: number };
		try {
			parsedBody = JSON.parse(event.body);
			console.log("Parsed body:", parsedBody);
		} catch (parseError: any) {
			console.error("Failed to parse request body:", parseError);
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "Invalid JSON in request body.",
					error: parseError.message || "Unknown parsing error",
				}),
			};
		}

		const plantTypeId = parsedBody.id;

		if (typeof plantTypeId !== "number") {
			console.error(
				"Missing or invalid 'id' in request body. Expected a number.",
			);
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message:
						"'id' (number) is a required field in the request body, e.g., {\"id\": 123}.",
				}),
			};
		}

		const command = new GetCommand({
			TableName: TABLE_NAME,
			Key: { id: plantTypeId },
		});

		const response = await docClient.send(command);
		const plantType = response.Item as PlantType | undefined;

		if (!plantType) {
			console.error(`Plant type with id ${plantTypeId} not found.`);
			return {
				statusCode: 404,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: `Plant type with id ${plantTypeId} not found.`,
				}),
			};
		}

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				plantType: plantType,
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
