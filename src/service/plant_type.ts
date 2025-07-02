import { TABLE_NAME, processRequest, parseData, BaseItemSchema } from "./utils";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  createRequestFail,
  createRequestSuccess,
  RequestResult,
} from "../requests";
import {
  CreatePlantTypeRequest,
  UpdatePlantTypeRequest,
  DeletePlantTypeRequest,
  GetPlantTypeRequest,
  GetPlantTypeListRequest,
  PlantType,
  CreatePlantTypeDTO,
  PlantTypeDatabase,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { PlantArraySchema } from "./plant";

export const PlantTypeDataSchema = z.object({
  name: z.string().min(1),
  picture: z.string().min(1),
  waterRequirement: z.string().min(1),
  sunRequirement: z.string().min(1),
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
        "getPlantType",
      );

      if (getPlantTypeResult.success) {
        const item = getPlantTypeResult.data;
        const parserResult = parseData(
          item,
          "getPlantType",
          PlantTypeDtoSchema,
        );
        return parserResult;
      } else {
        return getPlantTypeResult;
      }
    },
    async createPlantType(
      req: CreatePlantTypeRequest,
    ): Promise<RequestResult<"createPlantType", CreatePlantTypeDTO>> {
      const item = req.payload;
      const parserResult = parseData(
        item,
        "createPlantType",
        PlantTypeDataSchema,
      );
      if (parserResult.success) {
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
          "createPlantType",
        );
        if (createPlantTypeResult.success) {
          return createRequestSuccess("createPlantType")(
            parserResult.data,
            createPlantTypeResult.code,
            createPlantTypeResult.message,
          );
        } else {
          return createPlantTypeResult;
        }
      } else {
        return parserResult;
      }
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
        "updatePlantType",
      );
      if (!getPlantTypeResult.success) {
        return getPlantTypeResult;
      }
      const item = req.payload;
      const parserResult = parseData(item, "updatePlantType", PlantTypeSchema);
      if (parserResult.success) {
        const plantTypeDatabase: PlantTypeDatabase = {
          PK: `PLANT_TYPE#${parserResult.data.SK}`,
          SK: parserResult.data.SK,
          type: "PLANT_TYPE",
          GSI: req.payload.name,
          GSI2: "",
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
          "updatePlantType",
        );
        if (updatePlantTypeResult.success) {
          return createRequestSuccess("updatePlantType")(
            req.payload,
            updatePlantTypeResult.code,
            updatePlantTypeResult.message,
          );
        } else {
          return updatePlantTypeResult;
        }
      } else {
        return parserResult;
      }
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
        "deletePlantType",
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
        "deletePlantType",
      );
      if (deletePlantTypeResult.success) {
        const getUncategorizedPlantTypeCommand = async () => {
          const { Items } = await db.send(
            new QueryCommand({
              TableName: TABLE_NAME,
              IndexName: "GSIndex",
              KeyConditionExpression: "GSI = :nameValue",
              ExpressionAttributeValues: {
                ":nameValue": "Uncategorized",
              },
            }),
          );
          return Items;
        };
        const getUncategorizedPlantTypeResult = await processRequest(
          getUncategorizedPlantTypeCommand,
          "deletePlantType",
        );
        if (getUncategorizedPlantTypeResult.success) {
          const plantTypeData = getUncategorizedPlantTypeResult.data;
          const parseResult = parseData(
            plantTypeData,
            "deletePlantType",
            PlantTypeArraySchema,
          );
          if (parseResult.success) {
            const uncategorizedPlantTypeUuid = parseResult.data[0].uuid;
            const getPlantTypeUuidListCommand = async () => {
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
            const getPlantTypeUuidListResult = await processRequest(
              getPlantTypeUuidListCommand,
              "deletePlantType",
            );
            if (getPlantTypeUuidListResult.success) {
              const plantTypeUuidData = getPlantTypeUuidListResult.data;
              const plantTypeUiidListResult = parseData(
                plantTypeUuidData,
                "deletePlantType",
                PlantArraySchema,
              );
              if (plantTypeUiidListResult.success) {
                const plantList = plantTypeUiidListResult.data;
                plantList.forEach(async (plant) => {
                  plant.GSI2 = uncategorizedPlantTypeUuid;
                  plant.data.plantTypeUuid = uncategorizedPlantTypeUuid;
                  const updatePlantCommand = async () =>
                    await db.send(
                      new PutCommand({
                        TableName: TABLE_NAME,
                        Item: plant,
                      }),
                    );
                  const updatePlantResult = await processRequest(
                    updatePlantCommand,
                    "createPlant",
                  );
                  if (!updatePlantResult.success) {
                    return updatePlantResult;
                  }
                });
              }
            }
          } else {
            return parseResult;
          }
        } else {
          return getUncategorizedPlantTypeResult;
        }
      }
      return deletePlantTypeResult;
    },
    async getPlantTypeList(
      req: GetPlantTypeListRequest,
    ): Promise<RequestResult<"getPlantTypeList", PlantType[]>> {
      const getPlantTypeListCommand = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "TypeIndex",
            KeyConditionExpression: "#typeAttr = :typeValue",
            ExpressionAttributeNames: {
              "#typeAttr": "type",
            },
            ExpressionAttributeValues: {
              ":typeValue": "PLANT_TYPE",
            },
          }),
        );
        return Items;
      };
      const getPlantTypeListResult = await processRequest(
        getPlantTypeListCommand,
        "getPlantTypeList",
      );
      if (getPlantTypeListResult.success) {
        const parsedData = getPlantTypeListResult.data;
        const parseResult = parseData(
          parsedData,
          "getPlantTypeList",
          PlantTypeArraySchema,
        );
        return parseResult;
      } else {
        return getPlantTypeListResult;
      }
    },
  };
};
