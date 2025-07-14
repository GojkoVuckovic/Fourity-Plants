import {
  processRequest,
  TABLE_NAME,
  parseData,
  BaseItemSchema,
  createQueryCommand,
  createListResponse,
} from "./utils";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import {
  CreateZoneRequest,
  UpdateZoneRequest,
  DeleteZoneRequest,
  GetZoneRequest,
  GetZoneListRequest,
  ListResponse,
  QueryResult,
} from "../types";
import { PlantArraySchema } from "./plant";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const ZoneDataSchema = z.object({
  employees: z.array(z.string().min(1)),
  name: z.string().min(1),
});

export const ZoneSchema = BaseItemSchema.extend({
  type: z.literal("ZONE"),
  data: ZoneDataSchema,
});

export const ZoneDtoSchema = ZoneSchema.transform((zoneEntry) => {
  const { SK, data } = zoneEntry;
  return {
    uuid: SK,
    ...data,
  };
});

export const ZoneArraySchema = z.array(ZoneDtoSchema);

export type CreateZoneDTO = z.infer<typeof ZoneDataSchema>;
export type ZoneDatabase = z.infer<typeof ZoneSchema>;
export type Zone = z.infer<typeof ZoneDtoSchema>;

export const ZoneService = (db: DynamoDBDocumentClient) => {
  return {
    async getZone(
      req: GetZoneRequest,
    ): Promise<RequestResult<"getZone", Zone>> {
      const getZoneCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `ZONE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };

      const getZoneResult = await processRequest(getZoneCommand, req.command);

      if (!getZoneResult.success) {
        return getZoneResult;
      }
      const item = getZoneResult.data;
      const parserResult = parseData(item, req.command, ZoneDtoSchema);
      return parserResult;
    },
    async createZone(
      req: CreateZoneRequest,
    ): Promise<RequestResult<"createZone", CreateZoneDTO>> {
      const item = req.payload;
      const parserResult = parseData(item, req.command, ZoneDataSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const zoneUuid: string = uuidv4();
      const zoneDatabase: ZoneDatabase = {
        PK: `ZONE#${zoneUuid}`,
        SK: zoneUuid,
        type: "ZONE",
        GSI: parserResult.data.name,
        GSI2: zoneUuid,
        data: {
          name: parserResult.data.name,
          employees: parserResult.data.employees,
        },
      };
      const createZoneCommand = async () =>
        await db.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: zoneDatabase,
          }),
        );
      const createZoneResult = await processRequest(
        createZoneCommand,
        req.command,
      );
      if (!createZoneResult.success) {
        return createZoneResult;
      }
      return createRequestSuccess(req.command)(
        parserResult.data,
        createZoneResult.code,
        createZoneResult.message,
      );
    },
    async updateZone(
      req: UpdateZoneRequest,
    ): Promise<RequestResult<"updateZone", Zone>> {
      const getZoneCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `ZONE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };

      const getZoneResult = await processRequest(getZoneCommand, req.command);

      if (!getZoneResult.success) {
        return getZoneResult;
      }

      const zoneDatabase: ZoneDatabase = {
        PK: `ZONE#${req.payload.uuid}`,
        SK: req.payload.uuid,
        type: "ZONE",
        GSI: req.payload.name,
        GSI2: "none",
        data: {
          name: req.payload.name,
          employees: req.payload.employees,
        },
      };
      const updateZoneCommand = async () =>
        await db.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: zoneDatabase,
          }),
        );
      const updateZoneResult = await processRequest(
        updateZoneCommand,
        req.command,
      );
      if (!updateZoneResult.success) {
        return updateZoneResult;
      }
      return createRequestSuccess(req.command)(
        req.payload,
        updateZoneResult.code,
        updateZoneResult.message,
      );
    },
    async deleteZone(
      req: DeleteZoneRequest,
    ): Promise<RequestResult<"deleteZone", any>> {
      const getZoneCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `ZONE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };
      const getZoneResult = await processRequest(getZoneCommand, req.command);
      if (!getZoneResult.success) {
        return getZoneResult;
      }
      const deleteZoneCommand = async () =>
        await db.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `ZONE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
      const deleteZoneResult = await processRequest(
        deleteZoneCommand,
        req.command,
      );
      if (!deleteZoneResult.success) {
        return deleteZoneResult;
      }
      const getZoneUuidListCommand = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSIndex",
            KeyConditionExpression: "GSI = :uuidValue",
            ExpressionAttributeValues: {
              ":uuidValue": req.payload.uuid,
            },
          }),
        );
        return Items;
      };
      const getZoneUuidListResult = await processRequest(
        getZoneUuidListCommand,
        req.command,
      );
      if (!getZoneUuidListResult.success) {
        return getZoneUuidListResult;
      }
      const zoneUuidData = getZoneUuidListResult.data;
      const zoneUiidListResult = parseData(
        zoneUuidData,
        req.command,
        PlantArraySchema,
      );
      if (!zoneUiidListResult.success) {
        return zoneUiidListResult;
      }
      const plantList = zoneUiidListResult.data;
      plantList.forEach(async (plant) => {
        plant.GSI = "0000-0000-0000-0001";
        plant.data.zoneUuid = "0000-0000-0000-0001";
        const updatePlantCommand = async () =>
          await db.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: plant,
            }),
          );
        const updatePlantResult = await processRequest(
          updatePlantCommand,
          req.command,
        );
        if (!updatePlantResult.success) {
          return updatePlantResult;
        }
      });
      return createRequestSuccess(req.command)(
        req.payload.uuid,
        400,
        "Zone deleted successfully",
      );
    },
    async getZoneList(
      req: GetZoneListRequest,
    ): Promise<RequestResult<"getZoneList", ListResponse<Array<Zone>>>> {
      const getZoneListCommand = async (): Promise<QueryResult> => {
        const { Items, LastEvaluatedKey } = await db.send(
          createQueryCommand(req.payload, "ZONE"),
        );
        return { Items, LastEvaluatedKey };
      };
      const getZoneListResult = await processRequest(
        getZoneListCommand,
        req.command,
      );
      if (!getZoneListResult.success) return getZoneListResult;
      const parsedData = getZoneListResult.data.Items;
      const parseResult = parseData(parsedData, req.command, ZoneArraySchema);
      if (!parseResult.success) return parseResult;
      const listResponse = createListResponse(
        parseResult.data,
        getZoneListResult.data.LastEvaluatedKey,
      );
      return createRequestSuccess(req.command)(listResponse, 200, "");
    },
  };
};
