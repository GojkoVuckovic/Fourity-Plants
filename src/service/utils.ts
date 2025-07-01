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
  SK: z.string().uuid(),
  type: z.string(),
  GSI: z.string(),
});

export const PlantDataSchema = z.object({
  zone_uuid: z.string().uuid().nullable().optional(),
  plant_type_uuid: z.string().uuid(),
  name: z.string().min(1),
  additionalInfo: z.string().min(1).nullable().optional(),
});

export const ZoneDataSchema = z.object({
  employees: z.array(z.string().min(1)),
  name: z.string().min(1),
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

export const PlantSchema = BaseItemSchema.extend({
  type: z.literal("PLANT"),
  data: PlantDataSchema,
});

export const ZoneSchema = BaseItemSchema.extend({
  type: z.literal("ZONE"),
  data: ZoneDataSchema,
});

export const PlantRecordSchema = BaseItemSchema.extend({
  type: z.literal("PLANT_RECORD"),
  data: PlantRecordDataSchema,
});

export const PlantDTOSchema = PlantSchema.transform((plantEntry) => {
  const { SK, data } = plantEntry;
  return {
    SK,
    ...data,
  };
});

export const ZoneDTOSchema = ZoneSchema.transform((zoneEntry) => {
  const { SK, data } = zoneEntry;
  return {
    SK,
    ...data,
  };
});

export const PlantRecordDTOSchema = PlantRecordSchema.transform(
  (plantRecordEntry) => {
    const { SK, data } = plantRecordEntry;
    return {
      SK,
      ...data,
    };
  },
);

export const PlantArraySchema = z.array(PlantDTOSchema);
export const ZoneArraySchema = z.array(ZoneDTOSchema);
export const plantRecordArraySchema = z.array(PlantRecordDTOSchema);

export const parseData = <
  OP extends string,
  SchemaType extends z.ZodType<Output, z.ZodTypeDef, Input>,
  Input = z.input<SchemaType>,
  Output = z.output<SchemaType>,
>(
  rawData: unknown,
  command: OP,
  schema: SchemaType,
): RequestResult<OP, Output> => {
  const result = schema.safeParse(rawData);

  if (result.success) {
    return createRequestSuccess(command)(result.data, 200, "Successful parse");
  } else {
    return createRequestFail(command)(500, result.error.message);
  }
};
