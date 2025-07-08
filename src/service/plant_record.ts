import {
  parseData,
  processRequest,
  TABLE_NAME,
  BaseItemSchema,
  createQueryCommand,
} from "./utils";
import {
  GetCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import { UpdatePlantRecordRequest, GetPlantRecordListRequest } from "../types";
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
  type: z.literal("plantRecord"),
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
        "updatePlantRecord",
      );
      if (!getPlantRecordResult.success) {
        return getPlantRecordResult;
      }
      const plantRecordParse = parseData(
        getPlantRecordResult.data,
        "updatePlantRecord",
        PlantRecordSchema,
      );
      if (!plantRecordParse.success) {
        return plantRecordParse;
      }
      const plantRecord = plantRecordParse.data;
      plantRecord.data.resolved = true;
      plantRecord.data.additionalInfo = req.payload.additionalInfo;
      const plantRecordDatabase: PlantRecordDatabase = {
        PK: plantRecord.PK,
        SK: plantRecord.SK,
        type: "plantRecord",
        GSI: plantRecord.SK,
        GSI2: "",
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
        "updatePlantRecord",
      );
      if (!updatePlantRecordResult.success) {
        return updatePlantRecordResult;
      }
      return createRequestSuccess("updatePlantRecord")(
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
    ): Promise<RequestResult<"getPlantRecordList", PlantRecord[]>> {
      const getPlantRecordListCommand = async () => {
        const { Items } = await db.send(
          createQueryCommand(req.payload, "PLANT_RECORD"),
        );
        return Items;
      };
      const getPlantRecordListResult = await processRequest(
        getPlantRecordListCommand,
        "getPlantRecordList",
      );
      if (!getPlantRecordListResult.success) return getPlantRecordListResult;
      const parsedData = getPlantRecordListResult.data;
      const parseResult = parseData(
        parsedData,
        "getPlantRecordList",
        PlantRecordArraySchema,
      );
      return parseResult;
    },
  };
};
