import { PlantType, CreatePlantTypeDto } from "./service/plant_type";
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
  lastKey?: {
    PK: string;
    SK: string;
  };
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

export type CreatePlantTypeRequest = {
  command: "createPlantType";
  payload: CreatePlantTypeDto;
};

export type UpdatePlantTypeRequest = {
  command: "updatePlantType";
  payload: PlantType;
};

export type DeletePlantTypeRequest = {
  command: "deletePlantType";
  payload: { uuid: string };
};

export type GetPlantTypeRequest = {
  command: "getPlantType";
  payload: { uuid: string };
};

export type GetPlantTypeListRequest = {
  command: "getPlantTypeList";
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
  payload: { employeeNames: string[] };
};

export type EmployeeRequests = GetEmployeeNamesRequest;

type PlantRequests =
  | CreatePlantRequest
  | UpdatePlantRequest
  | DeletePlantRequest
  | GetPlantRequest
  | GetPlantListRequest;

type PlantRecordRequests = UpdatePlantRecordRequest | GetPlantRecordListRequest;

type PlantTypeRequests =
  | CreatePlantTypeRequest
  | UpdatePlantTypeRequest
  | DeletePlantTypeRequest
  | GetPlantTypeRequest
  | GetPlantTypeListRequest;

type ScheduleRequests = CreateScheduleRequest | GetScheduleRequest;

type ScoreboardRequests = GetScoreboardRequest;

type ZoneRequests =
  | CreateZoneRequest
  | UpdateZoneRequest
  | DeleteZoneRequest
  | GetZoneRequest
  | GetZoneListRequest;

export type Req =
  | EmployeeRequests
  | PlantRequests
  | PlantRecordRequests
  | PlantTypeRequests
  | ScheduleRequests
  | ScoreboardRequests
  | ZoneRequests;
