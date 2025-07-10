import { TABLE_NAME, processRequest, parseData } from "./utils";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createRequestFail, RequestResult } from "../requests";
import { CreateScheduleRequest, GetScheduleRequest } from "../types";
import {
  PlantRecordArraySchema,
  PlantRecord,
  PlantRecordSchema,
  PlantRecordDtoSchema,
} from "./plant_record";
import { WebClient } from "@slack/web-api";
import { QueryResult } from "../types";
import { createQueryCommand, createListResponse } from "./utils";
import { PlantDtoArraySchema } from "./plant";

export const scheduleService = (
  db: DynamoDBDocumentClient,
  slack: WebClient,
) => {
  return {
    async createSchedule(
      req: CreateScheduleRequest,
    ): Promise<RequestResult<"createSchedule", string[]>> {
      const getPlantListCommand = async (): Promise<QueryResult> => {
        const { Items, LastEvaluatedKey } = await db.send(
          createQueryCommand({}, "PLANT"),
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
      const plants = parseResult.data;
      for (const plant of plants) {
        const getPlantRecordCommand = async (): Promise<QueryResult> => {
          const { Items, LastEvaluatedKey } = await db.send(
            new QueryCommand({
              TableName: TABLE_NAME,
              IndexName: "GSIndex",
              KeyConditionExpression: "GSI = :uuidValue",
              ExpressionAttributeValues: {
                ":uuidValue": plant.plantTypeUuid,
              },
              Limit: 1,
            }),
          );
          return { Items, LastEvaluatedKey };
        };
        const getPlantRecordResult = await processRequest(
          getPlantRecordCommand,
          req.command,
        );
        if (!getPlantRecordResult.success) return getPlantRecordResult;
        const parsedData = getPlantListResult.data.Items;
        const parseResult = parseData(
          parsedData,
          req.command,
          PlantRecordArraySchema,
        );
        if (!parseResult.success) return parseResult;
        const plantRecord = parseResult.data[0];
        const waterDate = new Date();
        //TODO, implement way to differenciate date for watering and moving to sun
      }
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
        req.command,
      );
      if (!getPlantRecordListResult.success) return getPlantRecordListResult;
      const parsedData = getPlantRecordListResult.data;
      const parseResult = parseData(
        parsedData,
        req.command,
        PlantRecordArraySchema,
      );
      return parseResult;
    },
  };
};
