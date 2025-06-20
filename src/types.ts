export type Plant = {
	id: number;
	zone_id?: number;
	plant_type_id: number;
	name: string;
	additionalInfo?: string;
};

export type PlantType = {
	id: number;
	name: string;
	picture: string;
	waterRequirement: string;
	sunRequirement: string;
};

export type Zone = {
	id: number;
	employees: string[];
	name: string;
};

export type PlantRecord = {
	id: number;
	plant_id: number;
	employee_name: string;
	isWater: boolean;
	isSun: boolean;
	date: string;
	resolved: boolean;
	additionalInfo?: string;
};

export type CreatePlantRequest = {
	command: "createPlant";
	payload: Plant;
};

export type UpdatePlantRequest = {
	command: "updatePlant";
	payload: Plant;
};

export type DeletePlantRequest = {
	command: "deletePlant";
	payload: { id: number };
};

export type GetPlantRequest = {
	command: "getPlant";
	payload: { id: number };
};

export type GetPlantListRequest = {
	command: "getPlantList";
	payload?: never;
};

export type CreatePlantTypeRequest = {
	command: "createPlantType";
	payload: PlantType;
};

export type UpdatePlantTypeRequest = {
	command: "updatePlantType";
	payload: PlantType;
};

export type DeletePlantTypeRequest = {
	command: "deletePlantType";
	payload: { id: number };
};

export type GetPlantTypeRequest = {
	command: "getPlantType";
	payload: { id: number };
};

export type GetPlantTypeListRequest = {
	command: "getPlantTypeList";
	payload?: never;
};

export type CreateZoneRequest = {
	command: "createZone";
	payload: Zone;
};

export type UpdateZoneRequest = {
	command: "updateZone";
	payload: Zone;
};

export type DeleteZoneRequest = {
	command: "deleteZone";
	payload: { id: number };
};

export type GetZoneRequest = {
	command: "getZone";
	payload: { id: number };
};

export type GetZoneListRequest = {
	command: "getZoneList";
	payload?: never;
};

export type UpdatePlantRecordRequest = {
	command: "updatePlantRecord";
	payload: { id: number; additionalInfo?: string };
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
