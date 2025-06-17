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

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const PLANT_TABLE_NAME: string = process.env.PLANT_TABLE_NAME || "";
const PLANT_TYPE_TABLE_NAME: string = process.env.PLANT_TYPE_TABLE_NAME || "";
const ZONE_TABLE_NAME: string = process.env.ZONE_TABLE_NAME || "";

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

		let plantData: Plant;
		try {
			plantData = JSON.parse(event.body);
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

		if (!plantData.id) {
			console.error("Missing 'id' in plantData.");
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "'id' is a required field for plant.",
				}),
			};
		}

		const plant_type_get_command = new GetCommand({
			TableName: PLANT_TYPE_TABLE_NAME,
			Key: { id: plantData.plant_type_id },
		});

		const plant_type_response = await docClient.send(plant_type_get_command);
		const plantType = plant_type_response.Item as PlantType | undefined;
		if (!plantType) {
			console.error(`Plant type with id ${plantData.plant_type_id} not found.`);
			return {
				statusCode: 404,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: `Plant type with id ${plantData.plant_type_id} not found.`,
				}),
			};
		}

		const zone_command = new GetCommand({
			TableName: ZONE_TABLE_NAME,
			Key: { id: plantData.zone_id },
		});

		const zone_response = await docClient.send(zone_command);
		const Zone = zone_response.Item as Zone | undefined;

		if (!Zone) {
			console.error(`zone with id ${plantData.zone_id} not found.`);
			return {
				statusCode: 404,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: `zone with id ${plantData.zone_id} not found.`,
				}),
			};
		}

		await docClient.send(
			new PutCommand({
				TableName: PLANT_TABLE_NAME,
				Item: plantData,
			}),
		);

		// Return a success response
		return {
			statusCode: 201, // 201 Created
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Plant created successfully!",
				plantType: plantData, // Return the created item
			}),
		};
	} catch (error: any) {
		// Type 'any' for error as it can be various types
		console.error("Error creating plant:", error);

		// Return an error response
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Failed to create plant.",
				error: error.message,
			}),
		};
	}
};
