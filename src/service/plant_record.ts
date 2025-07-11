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
import { createRequestSuccess, RequestResult } from "../requests";
import {
  UpdatePlantRecordRequest,
  GetPlantRecordListRequest,
  QueryResult,
  ListResponse,
} from "../types";
import { z } from "zod";

export const PlantRecordDataSchema = z.object({
  plantUuid: z.string().uuid(),
  employeeName: z.string().min(1),
  isWater: z.boolean(),
  isSun: z.boolean(),
  date: z.string().datetime("Date must be a valid ISO 8601 string"),
  resolved: z.boolean(),
  additionalInfo: z.string().min(1).nullable().optional(),
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
    async updatePlantRecord(
      req: UpdatePlantRecordRequest,
    ): Promise<RequestResult<"updatePlantRecord", PlantRecord>> {
      const getPlantRecordCommand = async () =>
        await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `plantRecord#${req.payload.uuid}`,
              SK: req.payload.uuid,
            },
          }),
        );
      const getPlantRecordResult = await processRequest(
        getPlantRecordCommand,
        req.command,
      );
      if (!getPlantRecordResult.success) {
        return getPlantRecordResult;
      }
      const plantRecordParse = parseData(
        getPlantRecordResult.data,
        req.command,
        PlantRecordSchema,
      );
      if (!plantRecordParse.success) {
        return plantRecordParse;
      }
      const plantRecord = plantRecordParse.data;
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const isoString = now.toISOString();
      plantRecord.data.date = isoString;
      plantRecord.data.resolved = true;
      plantRecord.data.additionalInfo = req.payload.additionalInfo;
      const plantRecordDatabase: PlantRecordDatabase = {
        PK: plantRecord.PK,
        SK: plantRecord.SK,
        type: "PLANT_RECORD",
        GSI: plantRecord.data.plantUuid,
        GSI2: plantRecord.data.date,
        data: {
          resolved: plantRecord.data.resolved,
          additionalInfo: plantRecord.data.additionalInfo,
          plantUuid: plantRecord.data.plantUuid,
          employeeName: plantRecord.data.employeeName,
          isWater: plantRecord.data.isWater,
          isSun: plantRecord.data.isSun,
          date: plantRecord.data.date,
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
        req.command,
      );
      if (!updatePlantRecordResult.success) {
        return updatePlantRecordResult;
      }
      return createRequestSuccess(req.command)(
        {
          uuid: plantRecord.SK,
          resolved: plantRecord.data.resolved,
          additionalInfo: plantRecord.data.additionalInfo,
          plantUuid: plantRecord.data.plantUuid,
          employeeName: plantRecord.data.employeeName,
          isWater: plantRecord.data.isWater,
          isSun: plantRecord.data.isSun,
          date: plantRecord.data.date,
        },
        200,
        "updated successfully",
      );
    },
    async getPlantRecordList(
      req: GetPlantRecordListRequest,
    ): Promise<
      RequestResult<"getPlantRecordList", ListResponse<Array<PlantRecord>>>
    > {
      const getPlantRecordListCommand = async (): Promise<QueryResult> => {
        const { Items, LastEvaluatedKey } = await db.send(
          createQueryCommand(req.payload, "PLANT_TYPE"),
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
