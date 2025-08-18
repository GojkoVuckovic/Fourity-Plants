import {
  TABLE_NAME,
  processRequest,
  parseData,
  createSlackMessage,
} from "./utils";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { createRequestSuccess, RequestResult } from "../requests";
import { CreateScheduleRequest } from "../types";
import { PlantRecordDatabase } from "./plant_record";
import { WebClient } from "@slack/web-api";
import { QueryResult } from "../types";
import { createQueryCommand, resolvePlantDuty } from "./utils";
import { PlantDtoArraySchema } from "./plant";
import { ZoneDtoSchema } from "./zone";
import { v4 as uuidv4 } from "uuid";

const CHANNEL_ID = process.env.CHANNEL_ID || "";

export type PlantRecordMessage = {
  uuid: string;
  date: string;
  plantName: string;
  employeeName: string;
  isWater: boolean;
  isSun: boolean;
  additionalInfo?: string | undefined | null;
};

export const scheduleService = (
  db: DynamoDBDocumentClient,
  slack: WebClient,
) => {
  return {
    async createSchedule(
      req: CreateScheduleRequest,
    ): Promise<RequestResult<"createSchedule", void>> {
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
      const zones = new Map<string, { index: number; employees: string[] }>();
      const plantRecords: PlantRecordMessage[] = [];
      for (const plant of plants) {
        const { isWater, isSun } = resolvePlantDuty(
          plant.lastTimeWatered,
          plant.lastTimeSunlit,
          plant.waterRequirement,
          plant.sunRequirement,
        );
        if (!isWater && !isSun) {
          continue;
        }
        if (!plant.zoneUuid) continue;
        if (!zones.has(plant.zoneUuid)) {
          const getZoneCommand = async () => {
            const { Item } = await db.send(
              new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                  PK: `ZONE#${plant.zoneUuid}`,
                  SK: plant.zoneUuid,
                },
              }),
            );
            return Item;
          };

          const getZoneResult = await processRequest(
            getZoneCommand,
            req.command,
          );

          if (!getZoneResult.success) {
            return getZoneResult;
          }
          const item = getZoneResult.data;
          const parserResult = parseData(item, req.command, ZoneDtoSchema);
          if (!parserResult.success) {
            return parserResult;
          }
          const zone = parserResult.data;
          zones.set(zone.uuid, { index: 0, employees: zone.employees });
        }
        const zone = zones.get(plant.zoneUuid)!;
        const employee = zone.employees[zone.index];
        zones.set(plant.zoneUuid, {
          index: (zone.index + 1) % zone.employees.length,
          employees: zone.employees,
        });
        const plantRecordUuid: string = uuidv4();
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        const isoString = now.toISOString();
        const plantRecord: PlantRecordDatabase = {
          PK: `PLANT_RECORD#${plantRecordUuid}`,
          SK: plantRecordUuid,
          type: "PLANT_RECORD",
          GSI: plant.uuid,
          GSI2: false.toString(),
          data: {
            resolved: false,
            additionalInfo: "",
            plantUuid: plant.uuid,
            employeeName: employee,
            isWater: isWater,
            isSun: isSun,
            date: isoString,
          },
        };
        const createPlantRecordCommand = async () =>
          await db.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: plantRecord,
            }),
          );
        const createPlantRecordResult = await processRequest(
          createPlantRecordCommand,
          req.command,
        );
        if (!createPlantRecordResult.success) {
          return createPlantRecordResult;
        }
        const message: PlantRecordMessage = {
          uuid: plantRecord.SK,
          date: plantRecord.data.date,
          plantName: plant.name,
          employeeName: plantRecord.data.employeeName,
          isWater: plantRecord.data.isWater,
          isSun: plantRecord.data.isSun,
          additionalInfo: plantRecord.data.additionalInfo || "",
        };
        plantRecords.push(message);
      }
      for (const plantRecord of plantRecords) {
        const postMessageArgs = createSlackMessage(plantRecord, CHANNEL_ID);
        const postScheduleCommand = async () => {
          return await slack.chat.postMessage(postMessageArgs);
        };
        const postScheduleResult = await processRequest(
          postScheduleCommand,
          req.command,
        );
        if (!postScheduleResult.success) {
          return postScheduleResult;
        }
      }
      return createRequestSuccess(req.command)(
        undefined,
        200,
        "successfully created a schedule",
      );
    },
  };
};
