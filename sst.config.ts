/// <reference path="./.sst/platform/config.d.ts" />
import { remote, types } from "@pulumi/command";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

export default $config({
	app(input) {
		return {
			name: "fourity-plants",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			region: "eu-east-1",
		};
	},
	async run() {
		// const image = new awsx.ecr.Image("image", {
		// 	repositoryUrl:
		// 		"351931932329.dkr.ecr.eu-central-1.amazonaws.com/fourity/fourity-plants",
		// 	context: "./docker",
		// 	platform: "linux/amd64",
		// });

		// const config = new pulumi.Config();

		// const userName = config.require("fourity"); //userName
		// const serverPublicIp = config.require("192.168.0.58"); //ip of the server
		// const privatekey = config.requireSecret("privateKey"); //SSH i have in folder

		// const connection: types.input.remote.ConnectionArgs = {
		// 	host: serverPublicIp,
		// 	user: userName,
		// 	privateKey: privatekey,
		// };

		// const push = new remote.Command(
		// 	"docker",
		// 	{
		// 		connection: connection,
		// 		create: "pulling of docker image",
		// 		delete: "removal of docker image",
		// 		triggers: [image.imageUri],
		// 	},
		// 	{ dependsOn: image },
		// );

		const zone_table = new aws.dynamodb.Table("zone-table", {
			name: "zone-table",
			attributes: [{ name: "id", type: "N" }],
			hashKey: "id",
			billingMode: "PROVISIONED",
			readCapacity: 5,
			writeCapacity: 5,
		});

		const plant_type_table = new aws.dynamodb.Table("plant-type-table", {
			name: "plant-type-table",
			attributes: [{ name: "id", type: "N" }],
			hashKey: "id",
			billingMode: "PROVISIONED",
			readCapacity: 5,
			writeCapacity: 5,
		});

		const plant_table = new aws.dynamodb.Table("plant-table", {
			name: "plant-table",
			attributes: [
				{ name: "id", type: "N" },
				{ name: "zone_id", type: "N" },
				{ name: "plant_type_id", type: "N" },
			],
			globalSecondaryIndexes: [
				{
					name: "zone_id_index",
					hashKey: "zone_id",
					projectionType: "ALL",
					readCapacity: 5,
					writeCapacity: 5,
				},
				{
					name: "plant_type_id_index",
					hashKey: "plant_type_id",
					projectionType: "ALL",
					readCapacity: 5,
					writeCapacity: 5,
				},
			],
			hashKey: "id",
			billingMode: "PROVISIONED",
			readCapacity: 5,
			writeCapacity: 5,
		});

		const plant_record_table = new aws.dynamodb.Table("plant-record-table", {
			name: "plant-record-table",
			attributes: [
				{ name: "id", type: "N" },
				{ name: "plantId", type: "N" },
			],
			globalSecondaryIndexes: [
				{
					name: "plantId-index",
					hashKey: "plantId",
					projectionType: "ALL",
					readCapacity: 5,
					writeCapacity: 5,
				},
			],
			hashKey: "id",
			billingMode: "PROVISIONED",
			readCapacity: 5,
			writeCapacity: 5,
		});

		const dispatcher = new sst.aws.Function("Dispatcher", {
			handler: "./src/dispatcher.handler",
			link: [plant_table, plant_type_table, zone_table, plant_record_table],
			url: true,
			environment: {
				PLANT_TABLE_NAME: plant_table.name,
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
				ZONE_TABLE_NAME: zone_table.name,
				PLANT_RECORD_TABLE_NAME: plant_record_table.name,
			},
		});
	},
});
