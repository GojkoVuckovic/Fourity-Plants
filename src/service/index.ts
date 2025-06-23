import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import * as employee from "./employee.ts";
import * as plant_record from "./plant_record.ts";
import * as plant_type from "./plant_type.ts";
import * as plant from "./plant.ts";
import * as schedule from "./schedule.ts";
import * as scoreboard from "./scoreboard.ts";
import * as zone from "./zone.ts";
import { assertUnreachable } from "./utils.ts";
import { Req } from "../types.ts";

export const ProcessRequest = async (data: Req) => {
	const client = new DynamoDBClient({});
	const docClient = DynamoDBDocumentClient.from(client);
	const plantServiceInstance = plant.plantService(docClient);
	switch (data.command) {
		case "createPlant":
			return plant.createPlantRequestFunc(data);
		case "updatePlant":
			return plant.updatePlantRequestFunc(data);
		case "deletePlant":
			return plant.deletePlantRequestFunc(data);
		case "getPlant":
			return plantServiceInstance.getPlant(data);
		case "getPlantList":
			return plant.getPlantListRequestFunc(data);
		case "createPlantType":
			return plant_type.createPlantTypeRequestFunc(data);
		case "updatePlantType":
			return plant_type.updatePlantTypeRequestFunc(data);
		case "deletePlantType":
			return plant_type.deletePlantTypeRequestFunc(data);
		case "getPlantType":
			return plant_type.getPlantTypeRequestFunc(data);
		case "getPlantTypeList":
			return plant_type.getPlantTypeListRequestFunc(data);
		case "createZone":
			return zone.createZoneRequestFunc(data);
		case "updateZone":
			return zone.updateZoneRequestFunc(data);
		case "deleteZone":
			return zone.deleteZoneRequestFunc(data);
		case "getZone":
			return zone.getZoneRequestFunc(data);
		case "getZoneList":
			return zone.getZoneListRequestFunc(data);
		case "updatePlantRecord":
			return plant_record.updatePlantRecordRequestFunc(data);
		case "getPlantRecordList":
			return plant_record.getPlantRecordListRequestFunc(data);
		case "createSchedule":
			return schedule.createScheduleRequestFunc(data);
		case "getSchedule":
			return schedule.getScheduleRequestFunc(data);
		case "getScoreboard":
			return scoreboard.getScoreboardRequestFunc(data);
		case "getEmployeeNames":
			return employee.getEmployeeNamesRequestFunc(data);
		default:
			return assertUnreachable("Unhandled command")(400, `Unhandled command`);
	}
};
