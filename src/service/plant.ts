import { parseData, processRequest, TABLE_NAME, BaseItemSchema } from "./utils";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  QueryCommandInput,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import {
  CreatePlantRequest,
  UpdatePlantRequest,
  DeletePlantRequest,
  GetPlantRequest,
  GetPlantListRequest,
} from "../types";

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const PlantDataSchema = z.object({
  zoneUuid: z.string().uuid().nullable().optional(),
  plantTypeUuid: z.string().uuid(),
  name: z.string().min(1),
  additionalInfo: z.string().min(1).nullable().optional(),
});

export const PlantSchema = BaseItemSchema.extend({
  type: z.literal("PLANT"),
  data: PlantDataSchema,
});

export const PlantDtoSchema = PlantSchema.transform((plantEntry) => {
  const { SK, data } = plantEntry;
  return {
    uuid: SK,
    ...data,
  };
});

export const PlantDtoArraySchema = z.array(PlantDtoSchema);

export const PlantArraySchema = z.array(PlantSchema);

export type CreatePlantDTO = z.infer<typeof PlantDataSchema>;
export type PlantDatabase = z.infer<typeof PlantSchema>;
export type Plant = z.infer<typeof PlantDtoSchema>;

export const plantService = (db: DynamoDBDocumentClient) => {
  return {
    async getPlant(
      req: GetPlantRequest,
    ): Promise<RequestResult<"getPlant", Plant>> {
      const getPlantCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };

      const getPlantResult = await processRequest(getPlantCommand, "getPlant");

      if (!getPlantResult.success) {
        return getPlantResult;
      }
      const item = getPlantResult.data;
      const parserResult = parseData(item, "getPlant", PlantDtoSchema);
      return parserResult;
    },
    async createPlant(
      req: CreatePlantRequest,
    ): Promise<RequestResult<"createPlant", CreatePlantDTO>> {
      const getPlantTypeCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.plantTypeUuid}`,
              SK: req.payload.plantTypeUuid,
            },
          }),
        );
        return Item;
      };
      const getPlantTypeResult = await processRequest(
        getPlantTypeCommand,
        "createPlant",
      );
      if (!getPlantTypeResult.success) {
        return getPlantTypeResult;
      }
      if (req.payload.zoneUuid) {
        const getZoneCommand = async () => {
          const { Item } = await db.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `ZONE#${req.payload.zoneUuid}`,
                SK: req.payload.zoneUuid,
              },
            }),
          );
          return Item;
        };
        const getZoneResult = await processRequest(
          getZoneCommand,
          "createPlant",
        );
        if (!getZoneResult.success) {
          return getZoneResult;
        }
      }
      const item = req.payload;
      const parserResult = parseData(item, "createPlant", PlantDataSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const plantUuid: string = uuidv4();
      const plantDatabase: PlantDatabase = {
        PK: `PLANT#${plantUuid}`,
        SK: plantUuid,
        type: "PLANT",
        GSI: parserResult.data.zoneUuid || "",
        GSI2: parserResult.data.plantTypeUuid,
        data: {
          plantTypeUuid: parserResult.data.plantTypeUuid,
          name: parserResult.data.name,
          zoneUuid: parserResult.data.zoneUuid,
          additionalInfo: parserResult.data.additionalInfo,
        },
      };
      const createPlantCommand = async () =>
        await db.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: plantDatabase,
          }),
        );
      const createPlantResult = await processRequest(
        createPlantCommand,
        "createPlant",
      );
      if (!createPlantResult.success) {
        return createPlantResult;
      }
      return createRequestSuccess("createPlant")(
        parserResult.data,
        createPlantResult.code,
        createPlantResult.message,
      );
    },
    async updatePlant(
      req: UpdatePlantRequest,
    ): Promise<RequestResult<"updatePlant", Plant>> {
      const getPlantCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };

      const getPlantResult = await processRequest(
        getPlantCommand,
        "updatePlant",
      );

      if (!getPlantResult.success) {
        return getPlantResult;
      }

      const getPlantTypeCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.plantTypeUuid}`,
              SK: req.payload.plantTypeUuid,
            },
          }),
        );
        return Item;
      };
      const getPlantTypeResult = await processRequest(
        getPlantTypeCommand,
        "updatePlant",
      );
      if (!getPlantTypeResult.success) {
        return getPlantTypeResult;
      }
      const getZoneCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `ZONE#${req.payload.zoneUuid}`,
              SK: req.payload.zoneUuid,
            },
          }),
        );
        return Item;
      };
      const getZoneResult = await processRequest(getZoneCommand, "updatePlant");
      if (!getZoneResult.success) {
        return getZoneResult;
      }
      const item = req.payload;
      const parserResult = parseData(item, "updatePlant", PlantDtoSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const plantDatabase: PlantDatabase = {
        PK: `PLANT#${parserResult.data.uuid}`,
        SK: parserResult.data.uuid,
        type: "PLANT",
        GSI: parserResult.data.zoneUuid || "",
        GSI2: parserResult.data.plantTypeUuid,
        data: {
          plantTypeUuid: parserResult.data.plantTypeUuid,
          name: parserResult.data.name,
          zoneUuid: parserResult.data.zoneUuid,
          additionalInfo: parserResult.data.additionalInfo,
        },
      };
      const updatePlantCommand = async () =>
        await db.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: plantDatabase,
          }),
        );
      const updatePlantResult = await processRequest(
        updatePlantCommand,
        "updatePlant",
      );
      if (!updatePlantResult.success) {
        return updatePlantResult;
      }
      return createRequestSuccess("updatePlant")(
        parserResult.data,
        updatePlantResult.code,
        updatePlantResult.message,
      );
    },
    async deletePlant(
      req: DeletePlantRequest,
    ): Promise<RequestResult<"deletePlant", any>> {
      const getPlantCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };

      const getPlantResult = await processRequest(
        getPlantCommand,
        "deletePlant",
      );

      if (!getPlantResult.success) {
        return getPlantResult;
      }
      const deletePlantCommand = async () =>
        await db.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `PLANT#${req.payload.uuid}`, SK: req.payload.uuid },
          }),
        );
      const deletePlantResult = await processRequest(
        deletePlantCommand,
        "deletePlant",
      );
      return deletePlantResult;
    },
    async getPlantList(
      req: GetPlantListRequest,
    ): Promise<RequestResult<"getPlantList", Plant[]>> {
      const getPlantListCommand = async () => {
        const params: QueryCommandInput = {
          TableName: TABLE_NAME,
          IndexName: "TypeIndex",
          KeyConditionExpression: "#typeAttr = :typeValue",
          ExpressionAttributeNames: {
            "#typeAttr": "type",
          },
          ExpressionAttributeValues: {
            ":typeValue": "PLANT",
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
      const getPlantListResult = await processRequest(
        getPlantListCommand,
        "getPlantList",
      );
      if (!getPlantListResult.success) return getPlantListResult;
      const parsedData = getPlantListResult.data;
      const parseResult = parseData(
        parsedData,
        "getPlantList",
        PlantDtoArraySchema,
      );
      return parseResult;
    },
  };
};
