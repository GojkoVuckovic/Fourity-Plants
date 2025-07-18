import { QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import {
  createRequestFail,
  createRequestSuccess,
  RequestFail,
  RequestResult,
} from "../requests";
import { z } from "zod";
import { ListPayload, ListRequests, ListResponse, Req } from "@src/types";
import { PlantRecordMessage } from "./schedule";

export const TABLE_NAME = process.env.TABLE_NAME || "Table";

export const assertUnreachable =
  <const OP extends string>(requestId: OP) =>
  (code: number, message: string): RequestFail<OP> =>
    createRequestFail(requestId)(code, message);

export const processRequest = async <
  OP extends string,
  U extends () => Promise<unknown>,
>(
  future: U,
  cmdName: OP,
): Promise<RequestResult<OP, Awaited<ReturnType<U>>>> => {
  try {
    const result = await future();
    return createRequestSuccess(cmdName)(
      result,
      200,
      "successful",
    ) as unknown as Promise<RequestResult<OP, Awaited<ReturnType<U>>>>;
  } catch (error: any) {
    return createRequestFail(cmdName)(500, error.message);
  }
};

export const BaseItemSchema = z.object({
  PK: z.string(),
  SK: z.string().uuid(),
  type: z.string(),
  GSI: z.string(),
  GSI2: z.string(),
});

export const parseData = <
  OP extends string,
  SchemaType extends z.ZodType<Output, z.ZodTypeDef, Input>,
  Input = z.input<SchemaType>,
  Output = z.output<SchemaType>,
>(
  rawData: unknown,
  command: OP,
  schema: SchemaType,
): RequestResult<OP, Output> => {
  const result = schema.safeParse(rawData);

  if (result.success) {
    return createRequestSuccess(command)(result.data, 200, "Successful parse");
  } else {
    return createRequestFail(command)(500, result.error.message);
  }
};

export const createQueryCommand = (
  payload: ListPayload,
  entityType: string,
): QueryCommand => {
  const params: QueryCommandInput = {
    TableName: TABLE_NAME,
    IndexName: "TypeIndex",
    KeyConditionExpression: "#typeAttr = :typeValue",
    ExpressionAttributeNames: {
      "#typeAttr": "type",
    },
    ExpressionAttributeValues: {
      ":typeValue": entityType,
    },
    Limit: payload.pageSize,
  };
  if (payload.startKey) {
    params.ExclusiveStartKey = payload.startKey;
  }
  return new QueryCommand(params);
};

const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 10;
export const resolvePageSize = (pageSize?: number): number => {
  if (!pageSize) return MIN_PAGE_SIZE;
  if (pageSize < MIN_PAGE_SIZE) return MIN_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) return MAX_PAGE_SIZE;
  return pageSize;
};

export const resolveListPayload = (payload: ListPayload): ListPayload => ({
  pageSize: resolvePageSize(payload.pageSize),
  startKey: payload.startKey,
});

export const resolveListRequest = <T extends ListRequests>(request: T): T => ({
  ...request,
  payload: resolveListPayload(request.payload),
});

export const createListResponse = <T>(
  data: T,
  lastKey?: Record<string, any>,
): ListResponse<T> => ({
  data,
  lastKey,
});

export const isListRequest = (request: Req): request is ListRequests => {
  return (
    request.command === "getZoneList" ||
    request.command === "getPlantList" ||
    request.command === "getPlantRecordList"
  );
};

const addDaysToUTCDate = (dateIso: string, days: number): Date => {
  const date = new Date(dateIso);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

export const resolvePlantDuty = (
  lastWateredIso: string,
  lastSunlitIso: string,
  waterReq: number,
  sunReq: number,
): { isWater: boolean; isSun: boolean } => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const nextWatered = addDaysToUTCDate(lastWateredIso, waterReq);
  const nextSunlit = addDaysToUTCDate(lastSunlitIso, sunReq);

  const isWater = nextWatered <= today;
  const isSun = nextSunlit <= today;

  return { isWater, isSun };
};

export const createSlackMessage = (
  plantRecord: PlantRecordMessage,
  channelId: string,
) => {
  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🌱 Daily Plant Care Log",
        emoji: true,
      },
    },
    {
      type: "divider",
    },
  ];

  if (plantRecord) {
    let actionsText: string[] = [];
    if (plantRecord.isWater) {
      actionsText.push("💧 Water");
    }
    if (plantRecord.isSun) {
      actionsText.push("☀️ Move to sun");
    }
    const actionsSummary =
      actionsText.length > 0
        ? actionsText.join(" & ")
        : "No specific action recorded";

    const recordBlock = {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Plant:* ${plantRecord.plantName}\n*Employee:* ${plantRecord.employeeName}\n*When:* Today\n*Actions:* ${actionsSummary}`,
      },
    };
    blocks.push(recordBlock);

    const actionsBlock = {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "📝 Complete",
            emoji: true,
          },
          style: "primary",
          value: JSON.stringify({
            uuid: plantRecord.uuid,
            employeeName: plantRecord.employeeName,
          }),
          action_id: "complete-task",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "📝 Delegate to self",
            emoji: true,
          },
          value: JSON.stringify({
            uuid: plantRecord.uuid,
            employeeName: plantRecord.employeeName,
            plantName: plantRecord.plantName,
          }),
          action_id: "delegate-task",
        },
      ],
    };
    blocks.push(actionsBlock);

    if (plantRecord.additionalInfo) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `_Additional Info: ${plantRecord.additionalInfo}_`,
          },
        ],
      });
    }
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "No new plant care records for today.",
      },
    });
  }

  blocks.push(
    {
      type: "divider",
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `_Report generated by your Plant Care System on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}_`,
        },
      ],
    },
  );

  return {
    channel: channelId,
    text: "Plant task",
    blocks: blocks,
    callback_id: "plant-task",
  };
};

export const createScoreboardMessage = (
  scoreboard: {
    [employeeName: string]: number;
  },
  channelId: string,
) => {
  let message: string = "*🏆 Scoreboard 🏆*\n\n";
  const sortedEmployees: Array<{ name: string; score: number }> =
    Object.entries(scoreboard)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);
  sortedEmployees.forEach((employee, index) => {
    let emoji: string = "";
    switch (index) {
      case 0:
        emoji = ":first_place_medal:";
        break;
      case 1:
        emoji = ":second_place_medal:";
        break;
      case 2:
        emoji = ":third_place_medal:";
        break;
      case 3:
        emoji = ":four:";
        break;
      case 4:
        emoji = ":five:";
        break;
      default:
        emoji = `:${index + 1}:`;
        break;
    }
    message += `${emoji} *${employee.name}*: ${employee.score} points\n`;
  });

  return {
    channel: channelId,
    text: message,
    callback_id: "scoreboard",
  };
};
