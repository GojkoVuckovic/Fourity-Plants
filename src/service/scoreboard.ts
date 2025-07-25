import { TABLE_NAME, processRequest, parseData } from "./utils";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import { GetScoreboardRequest } from "../types";
import { PlantRecord, PlantRecordArraySchema } from "./plant_record";

export const scoreboardService = (db: DynamoDBDocumentClient) => {
  return {
    async getScoreboard(
      req: GetScoreboardRequest,
    ): Promise<
      RequestResult<"getScoreboard", { [employee_name: string]: number }>
    > {
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
              ":typeValue": "PLANT_RECORD",
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
      if (!parseResult.success) {
        return parseResult;
      }
      const employeeNameCounts = parseResult.data
        .filter((record: PlantRecord) => record.resolved === true)
        .reduce(
          (acc: { [key: string]: number }, record: PlantRecord) => {
            const name = record.employeeName;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          },
          {} as { [employee_name: string]: number },
        );
      return createRequestSuccess("getScoreboard")(employeeNameCounts, 200, "");
    },
  };
};
