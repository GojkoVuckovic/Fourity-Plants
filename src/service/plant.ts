import {
  parseData,
  processRequest,
  TABLE_NAME,
  BaseItemSchema,
  createQueryCommand,
  createListResponse,
} from "./utils";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import {
  CreatePlantRequest,
  UpdatePlantRequest,
  DeletePlantRequest,
  GetPlantRequest,
  GetPlantListRequest,
  ListResponse,
  QueryResult,
} from "../types";

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const PlantDataSchema = z.object({
  zoneUuid: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  additionalInfo: z.string().min(1).nullable().optional(),
  picture: z.string().min(1),
  waterRequirement: z.number().min(1),
  sunRequirement: z.number().min(1),
  lastTimeWatered: z.string().datetime(),
  lastTimeSunlit: z.string().datetime(),
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

      const getPlantResult = await processRequest(getPlantCommand, req.command);

      if (!getPlantResult.success) {
        return getPlantResult;
      }
      const item = getPlantResult.data;
      const parserResult = parseData(item, req.command, PlantDtoSchema);
      return parserResult;
    },
    async createPlant(
      req: CreatePlantRequest,
    ): Promise<RequestResult<"createPlant", CreatePlantDTO>> {
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
        const getZoneResult = await processRequest(getZoneCommand, req.command);
        if (!getZoneResult.success) {
          return getZoneResult;
        }
      }
      const item = req.payload;
      const parserResult = parseData(item, req.command, PlantDataSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const plantUuid: string = uuidv4();
      const plantDatabase: PlantDatabase = {
        PK: `PLANT#${plantUuid}`,
        SK: plantUuid,
        type: "PLANT",
        GSI: parserResult.data.zoneUuid || "",
        GSI2: plantUuid,
        data: {
          name: parserResult.data.name,
          zoneUuid: parserResult.data.zoneUuid,
          additionalInfo: parserResult.data.additionalInfo,
          waterRequirement: parserResult.data.waterRequirement,
          sunRequirement: parserResult.data.sunRequirement,
          picture: parserResult.data.picture,
          lastTimeWatered: parserResult.data.lastTimeWatered,
          lastTimeSunlit: parserResult.data.lastTimeSunlit,
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
        req.command,
      );
      if (!createPlantResult.success) {
        return createPlantResult;
      }
      return createRequestSuccess(req.command)(
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

      const getPlantResult = await processRequest(getPlantCommand, req.command);

      if (!getPlantResult.success) {
        return getPlantResult;
      }

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

      const plantDatabase: PlantDatabase = {
        PK: `PLANT#${req.payload.uuid}`,
        SK: req.payload.uuid,
        type: "PLANT",
        GSI: req.payload.zoneUuid || "",
        GSI2: req.payload.uuid,
        data: {
          name: req.payload.name,
          zoneUuid: req.payload.zoneUuid,
          additionalInfo: req.payload.additionalInfo,
          waterRequirement: req.payload.waterRequirement,
          sunRequirement: req.payload.sunRequirement,
          picture: req.payload.picture,
          lastTimeWatered: req.payload.lastTimeWatered,
          lastTimeSunlit: req.payload.lastTimeSunlit,
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
        req.command,
      );
      if (!updatePlantResult.success) {
        return updatePlantResult;
      }
      return createRequestSuccess(req.command)(
        req.payload,
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

      const getPlantResult = await processRequest(getPlantCommand, req.command);

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
        req.command,
      );
      return deletePlantResult;
    },
    async getPlantList(
      req: GetPlantListRequest,
    ): Promise<RequestResult<"getPlantList", ListResponse<Array<Plant>>>> {
      const getPlantListCommand = async (): Promise<QueryResult> => {
        const { Items, LastEvaluatedKey } = await db.send(
          createQueryCommand(req.payload, "PLANT"),
        );
        return { Items, LastEvaluatedKey };
      };
      const getPlantListResult = await processRequest(
        getPlantListCommand,
        req.command,
      );
      if (!getPlantListResult.success) return getPlantListResult;
      const parsedData = getPlantListResult.data.Items;
      const parseResult = parseData(
        parsedData,
        req.command,
        PlantDtoArraySchema,
      );
      if (!parseResult.success) return parseResult;
      const listResponse = createListResponse(
        parseResult.data,
        getPlantListResult.data.LastEvaluatedKey,
      );
      return createRequestSuccess(req.command)(listResponse, 200, "");
    },
  };
};
