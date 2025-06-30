export type Plant = {
	uuid: string;
	data: {
		zone_uuid?: string | null;
		plant_type_uuid: string;
		name: string;
		additionalInfo?: string | null;
	};
};

export type CreatePlantDTO = {
	zone_uuid?: string | null;
	plant_type_uuid: string;
	name: string;
	additionalInfo?: string | null;
};

export type PlantType = {
	uuid: string;
	data: {
		name: string;
		picture: string;
		waterRequirement: string;
		sunRequirement: string;
	};
};

export type CreatePlantTypeDTO = {
	name: string;
	picture: string;
	waterRequirement: string;
	sunRequirement: string;
};

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

export type PlantDatabase = {
	PK: string;
	uuid: string;
	type: "PLANT";
	plant_type_uuid: string;
	name: string;
	zone_uuid?: string | null;
	additionalInfo?: string | null;
};

export type PlantTypeDatabase = {
	PK: string;
	uuid: string;
	type: "PLANT_TYPE";
	name: string;
	picture: string;
	waterRequirement: string;
	sunRequirement: string;
};

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
