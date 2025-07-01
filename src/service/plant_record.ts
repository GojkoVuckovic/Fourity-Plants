import {
  docClient,
  parseData,
  PlantRecordSchema,
  plantRecordArraySchema,
  processRequest,
  TABLE_NAME,
} from "./utils";
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
