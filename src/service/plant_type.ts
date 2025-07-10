import {
  TABLE_NAME,
  processRequest,
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
  CreatePlantTypeRequest,
  UpdatePlantTypeRequest,
  DeletePlantTypeRequest,
  GetPlantTypeRequest,
  GetPlantTypeListRequest,
  ListResponse,
  QueryResult,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { PlantArraySchema } from "./plant";

export const PlantTypeDataSchema = z.object({
  name: z.string().min(1),
  picture: z.string().min(1),
  waterRequirement: z.number().min(1),
  sunRequirement: z.number().min(1),
});

export const PlantTypeSchema = BaseItemSchema.extend({
  type: z.literal("PLANT_TYPE"),
  data: PlantTypeDataSchema,
});

export const PlantTypeDtoSchema = PlantTypeSchema.transform(
  (plantTypeEntry) => {
    const { SK, data } = plantTypeEntry;
    return {
      uuid: SK,
      ...data,
    };
  },
);

export const PlantTypeArraySchema = z.array(PlantTypeDtoSchema);

export type CreatePlantTypeDto = z.infer<typeof PlantTypeDataSchema>;
export type PlantTypeDatabase = z.infer<typeof PlantTypeSchema>;
export type PlantType = z.infer<typeof PlantTypeDtoSchema>;

export const plantTypeService = (db: DynamoDBDocumentClient) => {
  return {
    async getPlantType(
      req: GetPlantTypeRequest,
    ): Promise<RequestResult<"getPlantType", PlantType>> {
      const getPlantTypeCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };

      const getPlantTypeResult = await processRequest(
        getPlantTypeCommand,
        req.command,
      );

      if (!getPlantTypeResult.success) {
        return getPlantTypeResult;
      }
      const item = getPlantTypeResult.data;
      const parserResult = parseData(item, req.command, PlantTypeDtoSchema);
      return parserResult;
    },
    async createPlantType(
      req: CreatePlantTypeRequest,
    ): Promise<RequestResult<"createPlantType", CreatePlantTypeDto>> {
      const item = req.payload;
      const parserResult = parseData(item, req.command, PlantTypeDataSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const plantTypeUuid: string = uuidv4();
      const plantTypeDatabase: PlantTypeDatabase = {
        PK: `PLANT_TYPE#${plantTypeUuid}`,
        SK: plantTypeUuid,
        type: "PLANT_TYPE",
        GSI: parserResult.data.name,
        GSI2: "",
        data: {
          name: parserResult.data.name,
          picture: parserResult.data.picture,
          waterRequirement: parserResult.data.waterRequirement,
          sunRequirement: parserResult.data.sunRequirement,
        },
      };
      const createPlantTypeCommand = async () =>
        await db.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: plantTypeDatabase,
          }),
        );
      const createPlantTypeResult = await processRequest(
        createPlantTypeCommand,
        req.command,
      );
      if (!createPlantTypeResult.success) {
        return createPlantTypeResult;
      }
      return createRequestSuccess(req.command)(
        parserResult.data,
        createPlantTypeResult.code,
        createPlantTypeResult.message,
      );
    },
    async updatePlantType(
      req: UpdatePlantTypeRequest,
    ): Promise<RequestResult<"updatePlantType", PlantType>> {
      const getPlantTypeCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };
      const getPlantTypeResult = await processRequest(
        getPlantTypeCommand,
        req.command,
      );
      if (!getPlantTypeResult.success) {
        return getPlantTypeResult;
      }
      const item = req.payload;
      const parserResult = parseData(item, req.command, PlantTypeSchema);
      if (!parserResult.success) {
        return parserResult;
      }
      const plantTypeDatabase: PlantTypeDatabase = {
        PK: `PLANT_TYPE#${parserResult.data.SK}`,
        SK: parserResult.data.SK,
        type: "PLANT_TYPE",
        GSI: req.payload.name,
        GSI2: parserResult.data.SK,
        data: {
          name: req.payload.name,
          picture: req.payload.picture,
          waterRequirement: req.payload.waterRequirement,
          sunRequirement: req.payload.sunRequirement,
        },
      };
      const updatePlantTypeCommand = async () =>
        await db.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: plantTypeDatabase,
          }),
        );
      const updatePlantTypeResult = await processRequest(
        updatePlantTypeCommand,
        req.command,
      );
      if (!updatePlantTypeResult.success) {
        return updatePlantTypeResult;
      }
      const getPlantTypeUuidListCommand = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSI2ndex",
            KeyConditionExpression: "GSI2 = :uuidValue",
            ExpressionAttributeValues: {
              ":uuidValue": req.payload.uuid,
            },
          }),
        );
        return Items;
      };
      const getPlantTypeUuidListResult = await processRequest(
        getPlantTypeUuidListCommand,
        req.command,
      );
      if (!getPlantTypeUuidListResult.success) {
        return getPlantTypeUuidListResult;
      }
      const plantTypeUuidData = getPlantTypeUuidListResult.data;
      const plantTypeUiidListResult = parseData(
        plantTypeUuidData,
        req.command,
        PlantArraySchema,
      );
      if (!plantTypeUiidListResult.success) {
        return plantTypeUiidListResult;
      }
      const plantList = plantTypeUiidListResult.data;
      plantList.forEach(async (plant) => {
        plant.data.waterRequirement = req.payload.waterRequirement;
        plant.data.sunRequirement = req.payload.sunRequirement;
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
        req.payload,
        updatePlantTypeResult.code,
        updatePlantTypeResult.message,
      );
    },
    async deletePlantType(
      req: DeletePlantTypeRequest,
    ): Promise<RequestResult<"deletePlantType", any>> {
      const getPlantTypeCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
        return Item;
      };
      const getPlantTypeResult = await processRequest(
        getPlantTypeCommand,
        req.command,
      );
      if (!getPlantTypeResult.success) {
        return getPlantTypeResult;
      }
      const deletePlantTypeCommand = async () =>
        await db.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
      const deletePlantTypeResult = await processRequest(
        deletePlantTypeCommand,
        req.command,
      );
      if (!deletePlantTypeResult.success) {
        return deletePlantTypeResult;
      }
      const getPlantTypeUuidListCommand = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSI2ndex",
            KeyConditionExpression: "GSI2 = :uuidValue",
            ExpressionAttributeValues: {
              ":uuidValue": req.payload.uuid,
            },
          }),
        );
        return Items;
      };
      const getPlantTypeUuidListResult = await processRequest(
        getPlantTypeUuidListCommand,
        req.command,
      );
      if (!getPlantTypeUuidListResult.success) {
        return getPlantTypeUuidListResult;
      }
      const plantTypeUuidData = getPlantTypeUuidListResult.data;
      const plantTypeUiidListResult = parseData(
        plantTypeUuidData,
        req.command,
        PlantArraySchema,
      );
      if (!plantTypeUiidListResult.success) {
        return plantTypeUiidListResult;
      }
      const plantList = plantTypeUiidListResult.data;
      plantList.forEach(async (plant) => {
        plant.GSI2 = "0000-0000-0000-0000";
        plant.data.plantTypeUuid = "0000-0000-0000-0000";
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
        "Plant type deleted successfully",
      );
    },
    async getPlantTypeList(
      req: GetPlantTypeListRequest,
    ): Promise<
      RequestResult<"getPlantTypeList", ListResponse<Array<PlantType>>>
    > {
      const getPlantTypeListCommand = async (): Promise<QueryResult> => {
        const { Items, LastEvaluatedKey } = await db.send(
          createQueryCommand(req.payload, "PLANT_TYPE"),
        );
        return { Items, LastEvaluatedKey };
      };
      const getPlantTypeListResult = await processRequest(
        getPlantTypeListCommand,
        req.command,
      );
      if (!getPlantTypeListResult.success) return getPlantTypeListResult;
      const parsedData = getPlantTypeListResult.data.Items;
      const parseResult = parseData(
        parsedData,
        req.command,
        PlantTypeArraySchema,
      );
      if (!parseResult.success) return parseResult;
      const listResponse = createListResponse(
        parseResult.data,
        getPlantTypeListResult.data.LastEvaluatedKey,
      );
      return createRequestSuccess(req.command)(listResponse, 200, "");
    },
  };
};
