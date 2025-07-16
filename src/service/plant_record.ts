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
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
  createRequestFail,
  createRequestSuccess,
  RequestResult,
} from "../requests";
import { GetPlantRecordListRequest, QueryResult, ListResponse } from "../types";
import { z } from "zod";
import { PlantSchema, PlantDatabase } from "./plant";

export const PlantRecordDataSchema = z.object({
  plantUuid: z.string().uuid(),
  employeeName: z.string().min(1),
  isWater: z.boolean(),
  isSun: z.boolean(),
  date: z.string().datetime("Date must be a valid ISO 8601 string"),
  resolved: z.boolean(),
  additionalInfo: z.string().nullable().optional(),
});

export const PlantRecordSchema = BaseItemSchema.extend({
  type: z.literal("PLANT_RECORD"),
  data: PlantRecordDataSchema,
});

export const PlantRecordDtoSchema = PlantRecordSchema.transform(
  (plantRecordEntry) => {
    const { SK, data } = plantRecordEntry;
    return {
      uuid: SK,
      ...data,
    };
  },
);

export const PlantRecordArraySchema = z.array(PlantRecordDtoSchema);

export type CreatePlantRecordDTO = z.infer<typeof PlantRecordDataSchema>;
export type PlantRecordDatabase = z.infer<typeof PlantRecordSchema>;
export type PlantRecord = z.infer<typeof PlantRecordDtoSchema>;

export const plantRecordService = (db: DynamoDBDocumentClient) => {
  return {
    async completeTask(
      uuid: string,
      additionalInfo?: string,
    ): Promise<RequestResult<"completeTask", PlantRecord>> {
      const getPlantRecordCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_RECORD#${uuid}`,
              SK: uuid,
            },
          }),
        );
        return Item;
      };

      const getPlantRecordResult = await processRequest(
        getPlantRecordCommand,
        "completeTask",
      );
      if (!getPlantRecordResult.success) {
        return getPlantRecordResult;
      }

      const plantRecordParse = parseData(
        getPlantRecordResult.data,
        "completeTask",
        PlantRecordSchema,
      );
      if (!plantRecordParse.success) {
        return plantRecordParse;
      }

      const plantRecord = plantRecordParse.data;

      if (plantRecord.data.resolved) {
        return createRequestFail("completeTask")(200, "task_already_completed");
      }
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const isoString = now.toISOString();

      const plantRecordDatabase: PlantRecordDatabase = {
        PK: plantRecord.PK,
        SK: plantRecord.SK,
        type: "PLANT_RECORD",
        GSI: plantRecord.data.plantUuid,
        GSI2: plantRecord.SK,
        data: {
          resolved: true,
          additionalInfo: additionalInfo || "",
          plantUuid: plantRecord.data.plantUuid,
          employeeName: plantRecord.data.employeeName,
          isWater: plantRecord.data.isWater,
          isSun: plantRecord.data.isSun,
          date: isoString,
        },
      };

      const updatePlantRecordCommand = async () =>
        await db.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: plantRecordDatabase,
          }),
        );

      const updatePlantRecordResult = await processRequest(
        updatePlantRecordCommand,
        "completeTask",
      );
      if (!updatePlantRecordResult.success) {
        return updatePlantRecordResult;
      }

      // Get the plant to update its watering/sunlight timestamps
      const getPlantCommand = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT#${plantRecord.data.plantUuid}`,
              SK: plantRecord.data.plantUuid,
            },
          }),
        );
        return Item;
      };

      const getPlantResult = await processRequest(
        getPlantCommand,
        "completeTask",
      );
      if (!getPlantResult.success) {
        return getPlantResult;
      }

      const plantParse = parseData(
        getPlantResult.data,
        "completeTask",
        PlantSchema,
      );
      if (!plantParse.success) {
        return plantParse;
      }

      const plant = plantParse.data;

      // Update plant with new watering/sunlight timestamps
      const plantDatabase: PlantDatabase = {
        PK: plant.PK,
        SK: plant.SK,
        type: plant.type,
        GSI: plant.GSI,
        GSI2: plant.GSI2,
        data: {
          name: plant.data.name,
          zoneUuid: plant.data.zoneUuid,
          additionalInfo: plant.data.additionalInfo,
          waterRequirement: plant.data.waterRequirement,
          sunRequirement: plant.data.sunRequirement,
          picture: plant.data.picture,
          lastTimeWatered: plantRecord.data.isWater
            ? isoString
            : plant.data.lastTimeWatered,
          lastTimeSunlit: plantRecord.data.isSun
            ? isoString
            : plant.data.lastTimeSunlit,
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
        "completeTask",
      );
      if (!updatePlantResult.success) {
        return updatePlantResult;
      }

      return createRequestSuccess("completeTask")(
        {
          uuid: plantRecordDatabase.SK,
          resolved: plantRecordDatabase.data.resolved,
          additionalInfo: plantRecordDatabase.data.additionalInfo,
          plantUuid: plantRecordDatabase.data.plantUuid,
          employeeName: plantRecordDatabase.data.employeeName,
          isWater: plantRecordDatabase.data.isWater,
          isSun: plantRecordDatabase.data.isSun,
          date: plantRecordDatabase.data.date,
        },
        200,
        "Task completed successfully",
      );
    },
    async getPlantRecordList(
      req: GetPlantRecordListRequest,
    ): Promise<
      RequestResult<"getPlantRecordList", ListResponse<Array<PlantRecord>>>
    > {
      const getPlantRecordListCommand = async (): Promise<QueryResult> => {
        const { Items, LastEvaluatedKey } = await db.send(
          createQueryCommand(req.payload, "PLANT_RECORD"),
        );
        return { Items, LastEvaluatedKey };
      };
      const getPlantRecordListResult = await processRequest(
        getPlantRecordListCommand,
        req.command,
      );
      if (!getPlantRecordListResult.success) return getPlantRecordListResult;
      const parsedData = getPlantRecordListResult.data.Items;
      const parseResult = parseData(
        parsedData,
        req.command,
        PlantRecordArraySchema,
      );
      if (!parseResult.success) return parseResult;
      const listResponse = createListResponse(
        parseResult.data,
        getPlantRecordListResult.data.LastEvaluatedKey,
      );
      return createRequestSuccess(req.command)(listResponse, 200, "");
    },
  };
};
