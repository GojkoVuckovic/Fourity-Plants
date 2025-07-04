import { TABLE_NAME, processRequest, parseData } from "./utils";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createRequestFail, RequestResult } from "../requests";
import { CreateScheduleRequest, GetScheduleRequest } from "../types";
import { PlantRecordArraySchema, PlantRecord } from "./plant_record";

export const scheduleService = (db: DynamoDBDocumentClient) => {
  return {
    async createSchedule(
      req: CreateScheduleRequest,
    ): Promise<RequestResult<"createSchedule", string[]>> {
      return createRequestFail(req.command)(500, "NOT YET IMPLEMENTED");
    },
    async getSchedule(
      req: GetScheduleRequest,
    ): Promise<RequestResult<"getSchedule", PlantRecord[]>> {
      const getPlantRecordListCommand = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "TypeIndex",
            KeyConditionExpression: "#typeAttr = :typeValue",
            ExpressionAttributeNames: {
              "#typeAttr": "type",
            },
            ExpressionAttributeValues: {
              ":typeValue": "plantRecord",
            },
          }),
        );
        return Items;
      };
      const getPlantRecordListResult = await processRequest(
        getPlantRecordListCommand,
        "getSchedule",
      );
      if (!getPlantRecordListResult.success) return getPlantRecordListResult;
      const parsedData = getPlantRecordListResult.data;
      const parseResult = parseData(
        parsedData,
        "getSchedule",
        PlantRecordArraySchema,
      );
      return parseResult;
    },
  };
};
