import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import {
  createRequestFail,
  createRequestSuccess,
  RequestFail,
  RequestResult,
} from "../requests";
import { z } from "zod";
import { ListPayload } from "@src/types";

export const TABLE_NAME = process.env.TABLE_NAME || "Table";

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
  GSI2: z.string(),
});

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

export const createQueryCommand = (
  payload: ListPayload,
  entityType: string,
): QueryCommand => {
  const params: QueryCommandInput = {
    TableName: TABLE_NAME,
    IndexName: "TypeIndex",
    KeyConditionExpression: "#typeAttr = :typeValue",
    ExpressionAttributeNames: {
      "#typeAttr": "type",
    },
    ExpressionAttributeValues: {
      ":typeValue": entityType,
    },
    Limit: payload.pageSize,
  };
  if (payload.pageSize < 10 || payload.pageSize > 100) params.Limit = 10;
  if (payload.startKey) {
    params.ExclusiveStartKey = payload.startKey;
  }
  return new QueryCommand(params);
};
