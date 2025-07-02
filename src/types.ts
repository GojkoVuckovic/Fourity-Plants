import { z } from "zod";
import {
  PlantTypeDataSchema,
  PlantTypeSchema,
  PlantTypeDtoSchema,
} from "./service/plant_type";
import { PlantDataSchema, PlantSchema, PlantDtoSchema } from "./service/plant";
import { ZoneDataSchema, ZoneSchema, ZoneDTOSchema } from "./service/zone";
import {
  PlantRecordDataSchema,
  PlantRecordSchema,
  PlantRecordDTOSchema,
} from "./service/plant_record";

export type CreatePlantTypeDTO = z.infer<typeof PlantTypeDataSchema>;
export type PlantTypeDatabase = z.infer<typeof PlantTypeSchema>;
export type PlantType = z.infer<typeof PlantTypeDtoSchema>;
export type CreatePlantDTO = z.infer<typeof PlantDataSchema>;
export type PlantDatabase = z.infer<typeof PlantSchema>;
export type Plant = z.infer<typeof PlantDtoSchema>;

export type Zone = {
  uuid: string;
  data: { employees: string[]; name: string };
};

export type CreateZoneDTO = {
  employees: string[];
  name: string;
};

export type PlantRecord = {
  uuid: string;
  data: {
    plant_uuid: string;
    employee_name: string;
    isWater: boolean;
    isSun: boolean;
    date: string;
    resolved: boolean;
    additionalInfo?: string | null;
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
  payload?: never;
};

export type CreatePlantTypeRequest = {
  command: "createPlantType";
  payload: CreatePlantTypeDTO;
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
  payload?: never;
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
  payload?: never;
};

export type UpdatePlantRecordRequest = {
  command: "updatePlantRecord";
  payload: { uuid: string; additionalInfo?: string };
};

export type GetPlantRecordListRequest = {
  command: "getPlantRecordList";
  payload?: never;
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

export type ZoneDatabase = {
  PK: string;
  uuid: string;
  type: "ZONE";
  employees: string[];
  name: string;
};

export type PlantRecordDatabase = {
  PK: string;
  uuid: string;
  type: "PLANT_RECORD";
  plant_uuid: string;
  employee_name: string;
  isWater: boolean;
  isSun: boolean;
  date: string;
  resolved: boolean;
  additionalInfo?: string | null;
};
