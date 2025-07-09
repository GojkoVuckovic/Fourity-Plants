import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import {
  createRequestFail,
  createRequestSuccess,
  RequestFail,
  RequestResult,
} from "../requests";
import { z } from "zod";
import { ListPayload, ListRequests, ListResponse, Req } from "@src/types";

export const TABLE_NAME = process.env.TABLE_NAME || "Table";

export const assertUnreachable =
  <const OP extends string>(requestId: OP) =>
  (code: number, message: string): RequestFail<OP> =>
    createRequestFail(requestId)(code, message);

export const processRequest = async <
  OP extends string,
  U extends () => Promise<unknown>,
>(
  future: U,
  cmdName: OP,
): Promise<RequestResult<OP, Awaited<ReturnType<U>>>> => {
  try {
    const result = await future();
    return createRequestSuccess(cmdName)(
      result,
      200,
      "successful",
    ) as unknown as Promise<RequestResult<OP, Awaited<ReturnType<U>>>>;
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
  if (payload.startKey) {
    params.ExclusiveStartKey = payload.startKey;
  }
  return new QueryCommand(params);
};

const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 10;
export const resolvePageSize = (pageSize?: number): number => {
  if (!pageSize) return MIN_PAGE_SIZE;
  if (pageSize < MIN_PAGE_SIZE) return MIN_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return pageSize;
};

export const resolveListPayload = (payload: ListPayload): ListPayload => ({
  pageSize: resolvePageSize(payload.pageSize),
  startKey: payload.startKey,
});

export const resolveListRequest = <T extends ListRequests>(request: T): T => ({
  ...request,
  payload: resolveListPayload(request.payload),
});

export const createListResponse = <T>(
  data: T,
  lastKey?: Record<string, any>,
): ListResponse<T> => ({
  data,
  lastKey,
});

export const isListRequest = (request: Req): request is ListRequests => {
  return (
    request.command === "getZoneList" ||
    request.command === "getPlantList" ||
    request.command === "getPlantTypeList" ||
    request.command === "getPlantRecordList"
  );
};
