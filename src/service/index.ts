import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { WebClient } from "@slack/web-api";
import * as employee from "./employee";
import * as plant_record from "./plant_record";
import * as plant from "./plant";
import * as schedule from "./schedule";
import * as scoreboard from "./scoreboard";
import * as zone from "./zone";
import * as slack_interact from "./slack_interact";
import { assertUnreachable, isListRequest, resolveListRequest } from "./utils";
import { Req, SlackRequest } from "../types";
import { Resource } from "sst";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const slackClient = new WebClient(Resource.SLACK_BOT_TOKEN.value);
const plantServiceInstance = plant.plantService(docClient);
const plantRecordServiceInstance = plant_record.plantRecordService(docClient);
const employeeServiceInstance = employee.employeeService(slackClient);
const scheduleServiceInstance = schedule.scheduleService(
  docClient,
  slackClient,
);
const scoreboardServiceInstance = scoreboard.scoreboardService(docClient);
const zoneServiceInstance = zone.ZoneService(docClient);
const slackInteractServiceInstance = slack_interact.slackInteractService(
  slackClient,
  plantRecordServiceInstance,
  scoreboardServiceInstance,
);

export const ProcessRequest = async (data: Req) => {
  const paginationData = isListRequest(data) ? resolveListRequest(data) : {};
  switch (data.command) {
    case "createPlant":
      return plantServiceInstance.createPlant(data);
    case "updatePlant":
      return plantServiceInstance.updatePlant(data);
    case "deletePlant":
      return plantServiceInstance.deletePlant(data);
    case "getPlant":
      return plantServiceInstance.getPlant(data);
    case "getPlantList":
      return plantServiceInstance.getPlantList({ ...data, ...paginationData });
    case "createZone":
      return zoneServiceInstance.createZone(data);
    case "updateZone":
      return zoneServiceInstance.updateZone(data);
    case "deleteZone":
      return zoneServiceInstance.deleteZone(data);
    case "getZone":
      return zoneServiceInstance.getZone(data);
    case "getZoneList":
      return zoneServiceInstance.getZoneList({ ...data, ...paginationData });
    case "getPlantRecordList":
      return plantRecordServiceInstance.getPlantRecordList({
        ...data,
        ...paginationData,
      });
    case "createSchedule":
      return scheduleServiceInstance.createSchedule(data);
    case "getEmployeeNames":
      return employeeServiceInstance.getEmployeeNames(data);
    default:
      return assertUnreachable("Unhandled command")(400, `Unhandled command`);
  }
};

export const processSlackRequest = async (payload: SlackRequest) => {
  switch (payload.command) {
    case "complete-task": {
      console.log(payload);
      return slackInteractServiceInstance.openCompleteTaskModal(payload);
    }
    case "delegate-task":
      return slackInteractServiceInstance.delegateTask(payload);
    case "complete-task-modal":
      return slackInteractServiceInstance.resolveCompleteRequestModal(payload);
    case "/scoreboard":
      return slackInteractServiceInstance.showScoreboard();
    default:
      return assertUnreachable("Unhandled command")(400, `Unhandled command`);
  }
};
