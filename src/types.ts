import { Plant, CreatePlantDTO } from "./service/plant";
import {
  OpenCompleteTaskModalPayload,
  DelegateTaskPayload,
  ResolveCompleteRequestModalPayload,
} from "./service/slack_interact";
import { CreateZoneDTO, Zone } from "./service/zone";

export type ListPayload = {
  pageSize?: number;
  startKey?: {
    PK: string;
    SK: string;
  };
};

export type ListResponse<T> = {
  data: T;
  lastKey?: Record<string, any>;
};

export type QueryResult = {
  Items?: Record<string, any>;
  LastEvaluatedKey?: Record<string, any>;
};

export type CreatePlantRequest = {
  command: "createPlant";
  payload: CreatePlantDTO;
};

export type UpdatePlantRequest = {
  command: "updatePlant";
  payload: Plant;
};

export type DeletePlantRequest = {
  command: "deletePlant";
  payload: { uuid: string };
};

export type GetPlantRequest = {
  command: "getPlant";
  payload: { uuid: string };
};

export type GetPlantListRequest = {
  command: "getPlantList";
  payload: ListPayload;
};

export type CreateZoneRequest = {
  command: "createZone";
  payload: CreateZoneDTO;
};

export type UpdateZoneRequest = {
  command: "updateZone";
  payload: Zone;
};

export type DeleteZoneRequest = {
  command: "deleteZone";
  payload: { uuid: string };
};

export type GetZoneRequest = {
  command: "getZone";
  payload: { uuid: string };
};

export type GetZoneListRequest = {
  command: "getZoneList";
  payload: ListPayload;
};

export type GetPlantRecordListRequest = {
  command: "getPlantRecordList";
  payload: ListPayload;
};

export type CreateScheduleRequest = {
  command: "createSchedule";
  payload?: never;
};

export type GetEmployeeNamesRequest = {
  command: "getEmployeeNames";
  payload: {
    channel: string;
  };
};

export type OpenCompleteRequestModalRequest = {
  command: "complete-task";
  payload: OpenCompleteTaskModalPayload;
};

export type DelegateTaskRequest = {
  command: "delegate-task";
  payload: DelegateTaskPayload;
};

export type ResolveCompleteRequestModalRequest = {
  command: "complete-task-modal";
  payload: ResolveCompleteRequestModalPayload;
};

export type ShowScoreboardRequest = {
  command: "/scoreboard";
  payload?: never;
};

export type SlackRequest =
  | OpenCompleteRequestModalRequest
  | DelegateTaskRequest
  | ResolveCompleteRequestModalRequest
  | ShowScoreboardRequest;

export type ListRequests =
  | GetPlantListRequest
  | GetPlantRecordListRequest
  | GetZoneListRequest;

export type GetRequests =
  | GetEmployeeNamesRequest
  | GetPlantRequest
  | GetZoneRequest;

export type CreateRequests =
  | CreatePlantRequest
  | CreateZoneRequest
  | CreateScheduleRequest;

export type PutRequests = UpdatePlantRequest | UpdateZoneRequest;

export type DeleteRequests = DeletePlantRequest | DeleteZoneRequest;

export type Req =
  | ListRequests
  | GetRequests
  | CreateRequests
  | PutRequests
  | DeleteRequests;
