import { parseData, processRequest, TABLE_NAME, BaseItemSchema } from "./utils";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import {
  UpdatePlantRecordRequest,
  PlantRecord,
  GetPlantRecordListRequest,
  PlantRecordDatabase,
} from "../types";
import { z } from "zod";

export const PlantRecordDataSchema = z.object({
  plant_uuid: z.string().uuid(),
  employee_name: z.string().min(1),
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
      SK,
      ...data,
    };
  },
);

export const plantRecordArraySchema = z.array(PlantRecordDtoSchema);

export const plantRecordService = (db: DynamoDBDocumentClient) => {
  return {
    async updatePlantRecord(
      req: UpdatePlantRecordRequest,
    ): Promise<RequestResult<"updatePlantRecord", PlantRecord>> {
      const get_plant_record_command = async () =>
        await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_RECORD#${req.payload.uuid}`,
              uuid: req.payload.uuid,
            },
          }),
        );
      const get_plant_record_result = await processRequest(
        get_plant_record_command,
        "updatePlantRecord",
      );
      if (!get_plant_record_result.success) {
        return get_plant_record_result;
      } else {
        const plant_record_parse = parseData(
          get_plant_record_result,
          "updatePlantRecord",
          PlantRecordSchema,
        );
        if (plant_record_parse.success) {
          const plant_record = plant_record_parse.data;
          plant_record.data.resolved = true;
          plant_record.data.additionalInfo = req.payload.additionalInfo;
          const plant_record_database: PlantRecordDatabase = {
            PK: `PLANT_RECORD#${plant_record.uuid}`,
            uuid: plant_record.uuid,
            type: "PLANT_RECORD",
            resolved: plant_record.data.resolved,
            additionalInfo: plant_record.data.additionalInfo,
            plant_uuid: plant_record.data.plant_uuid,
            employee_name: plant_record.data.employee_name,
            isWater: plant_record.data.isWater,
            isSun: plant_record.data.isSun,
            date: plant_record.data.date,
          };
          const update_plant_record_command = async () =>
            await db.send(
              new PutCommand({
                TableName: TABLE_NAME,
                Item: plant_record_database,
              }),
            );
          const update_plant_record_result = await processRequest(
            update_plant_record_command,
            "updatePlantRecord",
          );
          if (update_plant_record_result.success) {
            return createRequestSuccess("updatePlantRecord")(
              plant_record,
              200,
              "updated successfully",
            );
          } else {
            return update_plant_record_result;
          }
        } else {
          return plant_record_parse;
        }
      }
    },
    async getPlantRecordList(
      req: GetPlantRecordListRequest,
    ): Promise<RequestResult<"getPlantRecordList", PlantRecord[]>> {
      const get_plant_record_list_command = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "TypeIndex",
            KeyConditionExpression: "#typeAttr = :typeValue",
            ExpressionAttributeNames: {
              "#typeAttr": "type",
            },
            ExpressionAttributeValues: {
              ":typeValue": { S: "PLANT_RECORD" },
            },
          }),
        );
        return Items;
      };
      const get_plant_record_list_result = await processRequest(
        get_plant_record_list_command,
        "getPlantRecordList",
      );
      if (get_plant_record_list_result.success) {
        const parse_data = [get_plant_record_list_result.data];
        const parse_result = parseData(
          parseData,
          "getPlantRecordList",
          plantRecordArraySchema,
        );
        return parse_result;
      } else {
        return get_plant_record_list_result;
      }
    },
  };
};
