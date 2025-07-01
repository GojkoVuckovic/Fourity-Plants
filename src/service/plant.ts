import {
  parseData,
  PlantArraySchema,
  PlantDTOSchema,
  PlantSchema,
  processRequest,
  TABLE_NAME,
} from "./utils";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import {
  createRequestFail,
  createRequestSuccess,
  RequestResult,
} from "../requests";
import {
  CreatePlantRequest,
  UpdatePlantRequest,
  DeletePlantRequest,
  GetPlantRequest,
  GetPlantListRequest,
  Plant,
  PlantDatabase,
  CreatePlantDTO,
} from "../types";

import { v4 as uuidv4 } from "uuid";

export const plantService = (db: DynamoDBDocumentClient) => {
  return {
    async getPlant(
      req: GetPlantRequest,
    ): Promise<RequestResult<"getPlant", Plant>> {
      const get_plant_command = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT#${req.payload.uuid}`,
              uuid: req.payload.uuid,
            },
          }),
        );
        return Item;
      };
      const get_plant_result = await processRequest(
        get_plant_command,
        "getPlant",
      );

      if (get_plant_result.success) {
        const item = get_plant_result.data;
        const parser_result = parseData(item, "getPlant", PlantSchema);
        return parser_result;
      } else {
        return get_plant_result;
      }
    },
    async createPlant(
      req: CreatePlantRequest,
    ): Promise<RequestResult<"createPlant", CreatePlantDTO>> {
      const get_plant_type_command = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.plant_type_uuid}`,
              uuid: req.payload.plant_type_uuid,
            },
          }),
        );
        return Item;
      };
      const get_plant_type_result = await processRequest(
        get_plant_type_command,
        "createPlant",
      );
      if (!get_plant_type_result.success) {
        return get_plant_type_result;
      }
      if (req.payload.zone_uuid) {
        const get_zone_command = async () => {
          const { Item } = await db.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `ZONE#${req.payload.zone_uuid}`,
                uuid: req.payload.zone_uuid,
              },
            }),
          );
          return Item;
        };
        const get_zone_result = await processRequest(
          get_zone_command,
          "createPlant",
        );
        if (!get_zone_result.success) {
          return get_zone_result;
        }
      }
      const item = req.payload;
      const parser_result = parseData(item, "createPlant", PlantDTOSchema);
      if (parser_result.success) {
        const plant_uuid: string = uuidv4();
        const plant_database: PlantDatabase = {
          PK: `PLANT#${plant_uuid}`,
          uuid: plant_uuid,
          type: "PLANT",
          plant_type_uuid: parser_result.data.data.plant_type_uuid,
          name: parser_result.data.data.name,
          zone_uuid: parser_result.data.data.zone_uuid,
          additionalInfo: parser_result.data.data.additionalInfo,
        };
        const create_plant_command = async () =>
          await db.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: plant_database,
            }),
          );
        const create_plant_result = await processRequest(
          create_plant_command,
          "createPlant",
        );
        if (create_plant_result.success) {
          return createRequestSuccess("createPlant")(
            parser_result.data.data,
            create_plant_result.code,
            create_plant_result.message,
          );
        } else {
          return create_plant_result;
        }
      } else {
        return parser_result;
      }
    },
    async updatePlant(
      req: UpdatePlantRequest,
    ): Promise<RequestResult<"updatePlant", Plant>> {
      const get_plant_command = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT#${req.payload.uuid}`,
              uuid: req.payload.uuid,
            },
          }),
        );
        return Item;
      };
      const get_plant_result = await processRequest(
        get_plant_command,
        "updatePlant",
      );
      if (!get_plant_result.success) {
        return get_plant_result;
      }
      const get_plant_type_command = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT_TYPE#${req.payload.data.plant_type_uuid}`,
              uuid: req.payload.data.plant_type_uuid,
            },
          }),
        );
        return Item;
      };
      const get_plant_type_result = await processRequest(
        get_plant_type_command,
        "updatePlant",
      );
      if (!get_plant_type_result.success) {
        return get_plant_type_result;
      }
      const get_zone_command = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `ZONE#${req.payload.data.zone_uuid}`,
              uuid: req.payload.data.zone_uuid,
            },
          }),
        );
        return Item;
      };
      const get_zone_result = await processRequest(
        get_zone_command,
        "updatePlant",
      );
      if (!get_zone_result.success) {
        return get_zone_result;
      }
      const item = req.payload;
      const parser_result = parseData(item, "updatePlant", PlantSchema);
      if (parser_result.success) {
        const plant_database: PlantDatabase = {
          PK: `PLANT#${parser_result.data.uuid}`,
          uuid: parser_result.data.uuid,
          type: "PLANT",
          plant_type_uuid: parser_result.data.data.plant_type_uuid,
          name: parser_result.data.data.name,
          zone_uuid: parser_result.data.data.zone_uuid,
          additionalInfo: parser_result.data.data.additionalInfo,
        };
        const update_plant_command = async () =>
          await db.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: plant_database,
            }),
          );
        const update_plant_result = await processRequest(
          update_plant_command,
          "updatePlant",
        );
        if (update_plant_result.success) {
          return createRequestSuccess("updatePlant")(
            parser_result.data,
            update_plant_result.code,
            update_plant_result.message,
          );
        } else {
          return update_plant_result;
        }
      } else {
        return parser_result;
      }
    },
    async deletePlant(
      req: DeletePlantRequest,
    ): Promise<RequestResult<"deletePlant", any>> {
      const get_plant_command = async () => {
        const { Item } = await db.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `PLANT#${req.payload.uuid}`,
              uuid: req.payload.uuid,
            },
          }),
        );
        return Item;
      };
      const get_plant_result = await processRequest(
        get_plant_command,
        "deletePlant",
      );
      if (!get_plant_result.success) {
        return get_plant_result;
      }
      const delete_plant_command = async () =>
        await db.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `PLANT#${req.payload.uuid}`, uuid: req.payload.uuid },
          }),
        );
      const delete_plant_result = await processRequest(
        delete_plant_command,
        "deletePlant",
      );
      return delete_plant_result;
    },
    async getPlantList(
      req: GetPlantListRequest,
    ): Promise<RequestResult<"getPlantList", Plant[]>> {
      const get_plant_list_command = async () => {
        const { Items } = await db.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "TypeIndex",
            KeyConditionExpression: "#typeAttr = :typeValue",
            ExpressionAttributeNames: {
              "#typeAttr": "type",
            },
            ExpressionAttributeValues: {
              ":typeValue": { S: "PLANT" },
            },
          }),
        );
        return Items;
      };
      const get_plant_list_result = await processRequest(
        get_plant_list_command,
        "getPlantList",
      );
      if (get_plant_list_result.success) {
        const parse_data = [get_plant_list_result.data];
        const parse_result = parseData(
          parse_data,
          "getPlantList",
          PlantArraySchema,
        );
        return parse_result;
      } else {
        return get_plant_list_result;
      }
    },
  };
};
