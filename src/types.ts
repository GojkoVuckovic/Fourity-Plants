import { Plant, CreatePlantDTO } from "./service/plant";
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

export type UpdatePlantRecordRequest = {
  command: "updatePlantRecord";
  payload: { uuid: string; additionalInfo?: string };
};

export type GetPlantRecordListRequest = {
  command: "getPlantRecordList";
  payload: ListPayload;
};

export type CreateScheduleRequest = {
  command: "createSchedule";
  payload?: never;
};

export type GetScheduleRequest = {
  command: "getSchedule";
  payload?: never;
};

export type GetScoreboardRequest = {
  command: "getScoreboard";
  payload?: never;
};

export type GetEmployeeNamesRequest = {
  command: "getEmployeeNames";
  payload: {
    channel: string;
  };
};

export type ListRequests =
  | GetPlantListRequest
  | GetPlantRecordListRequest
  | GetZoneListRequest;

export type GetRequests =
  | GetEmployeeNamesRequest
  | GetPlantRequest
  | GetZoneRequest
  | GetScheduleRequest
  | GetScoreboardRequest;

export type CreateRequests =
  | CreatePlantRequest
  | CreateZoneRequest
  | CreateScheduleRequest;

export type PutRequests =
  | UpdatePlantRequest
  | UpdateZoneRequest
  | UpdatePlantRecordRequest;

export type DeleteRequests = DeletePlantRequest | DeleteZoneRequest;

export type Req =
  | ListRequests
  | GetRequests
  | CreateRequests
  | PutRequests
  | DeleteRequests;
