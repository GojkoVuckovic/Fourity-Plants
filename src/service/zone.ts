import { processRequest, TABLE_NAME, parseData, BaseItemSchema } from "./utils";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import {
  CreateZoneRequest,
  UpdateZoneRequest,
  DeleteZoneRequest,
  GetZoneRequest,
  GetZoneListRequest,
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

      const getZoneResult = await processRequest(getZoneCommand, "getZone");

      if (!getZoneResult.success) {
        return getZoneResult;
      }
      const item = getZoneResult.data;
      const parserResult = parseData(item, "getZone", ZoneDtoSchema);
      return parserResult;
    },
    async createZone(
      req: CreateZoneRequest,
    ): Promise<RequestResult<"createZone", CreateZoneDTO>> {
      const item = req.payload;
      const parserResult = parseData(item, "createZone", ZoneDataSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const zoneUuid: string = uuidv4();
      const zoneDatabase: ZoneDatabase = {
        PK: `ZONE#${zoneUuid}`,
        SK: zoneUuid,
        type: "ZONE",
        GSI: parserResult.data.name,
        GSI2: "",
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
        "createZone",
      );
      if (!createZoneResult.success) {
        return createZoneResult;
      }
      return createRequestSuccess("createZone")(
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
      const getZoneResult = await processRequest(getZoneCommand, "updateZone");
      if (!getZoneResult.success) {
        return getZoneResult;
      }
      const item = req.payload;
      const parserResult = parseData(item, "updateZone", ZoneDtoSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const zoneDatabase: ZoneDatabase = {
        PK: `ZONE#${parserResult.data.uuid}`,
        SK: parserResult.data.uuid,
        type: "ZONE",
        GSI: req.payload.name,
        GSI2: "",
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
        "updateZone",
      );
      if (!updateZoneResult.success) {
        return updateZoneResult;
      }
      return createRequestSuccess("updateZone")(
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
      const getZoneResult = await processRequest(getZoneCommand, "deleteZone");
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
        "deleteZone",
      );
      if (!deleteZoneResult.success) {
        return deleteZoneResult;
      }
      const getUnassignedZoneCommand = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSIndex",
            KeyConditionExpression: "GSI = :nameValue",
            ExpressionAttributeValues: {
              ":nameValue": "Unassigned",
            },
          }),
        );
        return Items;
      };
      const getUnassignedZoneResult = await processRequest(
        getUnassignedZoneCommand,
        "deleteZone",
      );
      if (!getUnassignedZoneResult.success) {
        return getUnassignedZoneResult;
      }
      const zoneData = getUnassignedZoneResult.data;
      const parseResult = parseData(zoneData, "deleteZone", ZoneArraySchema);
      if (!parseResult.success) {
        return parseResult;
      }
      const uncategorizedZoneUuid = parseResult.data[0].uuid;
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
        "deleteZone",
      );
      if (!getZoneUuidListResult.success) {
        return getZoneUuidListResult;
      }
      const zoneUuidData = getZoneUuidListResult.data;
      const zoneUiidListResult = parseData(
        zoneUuidData,
        "deleteZone",
        PlantArraySchema,
      );
      if (!zoneUiidListResult.success) {
        return zoneUiidListResult;
      }
      const plantList = zoneUiidListResult.data;
      plantList.forEach(async (plant) => {
        plant.GSI = uncategorizedZoneUuid;
        plant.data.zoneUuid = uncategorizedZoneUuid;
        const updatePlantCommand = async () =>
          await db.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: plant,
            }),
          );
        const updatePlantResult = await processRequest(
          updatePlantCommand,
          "deleteZone",
        );
        if (!updatePlantResult.success) {
          return updatePlantResult;
        }
      });
      return createRequestSuccess("deleteZone")(
        req.payload.uuid,
        400,
        "Zone deleted successfully",
      );
    },
    async getZoneList(
      req: GetZoneListRequest,
    ): Promise<RequestResult<"getZoneList", Zone[]>> {
      const getZoneListCommand = async () => {
        const params: QueryCommandInput = {
          TableName: TABLE_NAME,
          IndexName: "TypeIndex",
          KeyConditionExpression: "#typeAttr = :typeValue",
          ExpressionAttributeNames: {
            "#typeAttr": "type",
          },
          ExpressionAttributeValues: {
            ":typeValue": "ZONE",
          },
          Limit: req.payload.pageSize,
        };
        if (req.payload.pageSize < 10 || req.payload.pageSize > 100)
          params.Limit = 10;
        if (req.payload.startKey) {
          params.ExclusiveStartKey = req.payload.startKey;
        }
        const { Items } = await db.send(new QueryCommand(params));
        return Items;
      };
      const getZoneListResult = await processRequest(
        getZoneListCommand,
        "getZoneList",
      );
      if (!getZoneListResult.success) return getZoneListResult;
      const parsedData = getZoneListResult.data;
      const parseResult = parseData(parsedData, "getZoneList", ZoneArraySchema);
      return parseResult;
    },
  };
};
