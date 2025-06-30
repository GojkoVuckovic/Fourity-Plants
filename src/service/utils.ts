import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	PutCommand,
	DynamoDBDocumentClient,
	GetCommand,
	DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
	createRequestFail,
	createRequestSuccess,
	RequestFail,
	RequestResult,
} from "../requests";
import { z } from "zod";

export const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);
export const TABLE_NAME = process.env.TABLE_NAME || "";

export const assertUnreachable =
	<const OP extends string>(requestId: OP) =>
	(code: number, message: string): RequestFail<OP> =>
		createRequestFail(requestId)(code, message);

export const processRequest = async <
	OP extends string,
	T,
	U extends () => Promise<T>,
>(
	future: U,
	cmdName: OP,
): Promise<RequestResult<OP, T>> => {
	try {
		const result = await future();
		return createRequestSuccess(cmdName)(result, 200, "successful");
	} catch (error: any) {
		return createRequestFail(cmdName)(500, error.message);
	}
};

export const BaseItemSchema = z.object({
	PK: z.string(),
	uuid: z.string().uuid(),
	type: z.string(),
	GSI: z.string(),
});

export const PlantDataSchema = z.object({
	zone_uuid: z
		.string()
		.uuid("Zone UUID must be a valid UUID string")
		.nullable()
		.optional(),
	plant_type_uuid: z
		.string()
		.uuid("Plant Type UUID must be a valid UUID string"),
	name: z.string().min(1, "Plant name cannot be empty"),
	additionalInfo: z
		.string()
		.min(1, "Additional info cannot be empty if present")
		.nullable()
		.optional(),
});

export const PlantDTOSchema = z.object({
	uuid: z.string().uuid(),
	data: PlantDataSchema,
});

export const PlantTypeDataSchema = z.object({
	name: z.string().min(1),
	picture: z.string().min(1),
	waterRequirement: z.string().min(1),
	sunRequirement: z.string().min(1),
});

export const PlantTypeDTOSchema = z.object({
	uuid: z.string().uuid(),
	data: PlantTypeDataSchema,
});

export const ZoneDataSchema = z.object({
	employees: z.array(z.string().min(1)),
	name: z.string().min(1),
});

export const ZoneDTOSchema = z.object({
	uuid: z.string().uuid(),
	data: ZoneDataSchema,
});

export const PlantRecordDataSchema = z.object({
	plant_uuid: z.string().uuid(),
	employee_name: z.string().min(1),
	isWater: z.boolean(),
	isSun: z.boolean(),
	date: z.string().datetime("Date must be a valid ISO 8601 string"),
	resolved: z.boolean(),
	additionalInfo: z.string().min(1).nullable().optional(),
});

export const PlantRecordDTOSchema = z.object({
	uuid: z.string().uuid(),
	data: PlantRecordDataSchema,
});

export const PlantSchema = BaseItemSchema.extend({
	type: z.literal("PLANT"),
	data: PlantDataSchema,
});

export const PlantTypeSchema = BaseItemSchema.extend({
	type: z.literal("PLANT_TYPE"),
	data: PlantTypeDataSchema,
});

export const ZoneSchema = BaseItemSchema.extend({
	type: z.literal("ZONE"),
	data: ZoneDataSchema,
});

export const PlantRecordSchema = BaseItemSchema.extend({
	type: z.literal("PLANT_RECORD"),
	data: PlantRecordDataSchema,
});

export const PlantArraySchema = z.array(PlantDTOSchema);
export const PlantTypeArraySchema = z.array(PlantTypeDTOSchema);
export const ZoneArraySchema = z.array(ZoneDTOSchema);
export const plantRecordArraySchema = z.array(PlantRecordDTOSchema);

export const parseData = <T, OP extends string>(
	rawData: unknown,
	command: OP,
	schema: z.ZodSchema<T>,
): RequestResult<OP, T> => {
	const result = schema.safeParse(rawData);

	if (result.success) {
		return createRequestSuccess(command)(result.data, 200, "Successful parse");
	} else {
		return createRequestFail(command)(500, result.error.message);
	}
};
