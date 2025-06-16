/// <reference path="./.sst/platform/config.d.ts" />
import { remote, types } from "@pulumi/command";

export default $config({
	app(input) {
		return {
			name: "fourity-plants",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			region: "us-east-1",
		};
	},
	async run() {
		const aws = await import("@pulumi/aws");
		const awsx = await import("@pulumi/awsx");
		const docker = await import("@pulumi/docker");
		const { remote, types } = await import("@pulumi/command");
		const pulumi = await import("@pulumi/pulumi");

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
				{ name: "zoneId", type: "N" },
				{ name: "plantTypeId", type: "N" },
			],
			globalSecondaryIndexes: [
				{
					name: "zoneId-index",
					hashKey: "zoneId",
					projectionType: "ALL",
					readCapacity: 5,
					writeCapacity: 5,
				},
				{
					name: "plantTypeId-index",
					hashKey: "plantTypeId",
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

		const create_plant_type = new sst.aws.Function("Create-Plant-Type", {
			handler: "./src/plant_type/create_plant_type.handler",
			link: [plant_type_table],
			environment: {
				DEBUG: "true",
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
			url: true,
			permissions: [
				{
					actions: ["dynamodb:PutItem"],
					resources: [plant_type_table.arn],
				},
			],
		});

		const delete_plant_type = new sst.aws.Function("Delete-Plant-Type", {
			handler: "./src/plant_type/delete_plant_type.handler",
			link: [plant_type_table],
			environment: {
				DEBUG: "true",
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
			url: true,
			permissions: [
				{
					actions: ["dynamodb:DeleteItem"],
					resources: [plant_type_table.arn],
				},
			],
		});

		const get_plant_type = new sst.aws.Function("Get-Plant-Type", {
			handler: "./src/plant_type/get_plant_type.handler",
			link: [plant_type_table],
			environment: {
				DEBUG: "true",
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
			url: true,
			permissions: [
				{
					actions: ["dynamodb:GetItem"],
					resources: [plant_type_table.arn],
				},
			],
		});

		const get_plant_type_list = new sst.aws.Function("Get-Plant-Type-List", {
			handler: "./src/plant_type/get_plant_type_list.handler",
			link: [plant_type_table],
			environment: {
				DEBUG: "true",
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
			url: true,
			permissions: [
				{
					actions: ["dynamodb:Scan"],
					resources: [plant_type_table.arn],
				},
			],
		});

		const update_plant_type = new sst.aws.Function("Update-Plant-Type", {
			handler: "./src/plant_type/update_plant_type.handler",
			link: [plant_type_table],
			environment: {
				DEBUG: "true",
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
			url: true,
			permissions: [
				{
					actions: ["dynamodb:*"],
					resources: [plant_type_table.arn],
				},
			],
		});

		// const create_plant = new sst.aws.Function("Create-Plant", {
		// 	handler: "./src/plant/create_plant.handler",
		// 	link: [plant_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:PutItem"],
		// 			resources: [plant_table.arn],
		// 		},
		// 	],
		// });

		// const delete_plant = new sst.aws.Function("Delete-Plant", {
		// 	handler: "./src/plant/delete_plant.handler",
		// 	link: [plant_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:DeleteItem"],
		// 			resources: [plant_table.arn],
		// 		},
		// 	],
		// });

		// const get_plant = new sst.aws.Function("Get-Plant", {
		// 	handler: "./src/plant/get_plant.handler",
		// 	link: [plant_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:GetItem"],
		// 			resources: [plant_table.arn],
		// 		},
		// 	],
		// });

		// const get_plant_list = new sst.aws.Function("Get-Plant-List", {
		// 	handler: "./src/plant/get_plant_list.handler",
		// 	link: [plant_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:Scan"],
		// 			resources: [plant_table.arn],
		// 		},
		// 	],
		// });

		// const update_plant = new sst.aws.Function("Update-Plant", {
		// 	handler: "./src/plant/update_plant.handler",
		// 	link: [plant_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:PutItem"],
		// 			resources: [plant_table.arn],
		// 		},
		// 	],
		// });

		// const create_zone = new sst.aws.Function("Create-Zone", {
		// 	handler: "./src/zone/create_zone.handler",
		// 	link: [zone_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:PutItem"],
		// 			resources: [zone_table.arn],
		// 		},
		// 	],
		// });

		// const delete_zone = new sst.aws.Function("Delete-Zone", {
		// 	handler: "./src/zone/delete_zone.handler",
		// 	link: [zone_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:DeleteItem"],
		// 			resources: [zone_table.arn],
		// 		},
		// 	],
		// });

		// const get_zone = new sst.aws.Function("Get-Zone", {
		// 	handler: "./src/zone/get_zone.handler",
		// 	link: [zone_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:GetItem"],
		// 			resources: [zone_table.arn],
		// 		},
		// 	],
		// });

		// const get_zone_list = new sst.aws.Function("Get-Zone-List", {
		// 	handler: "./src/zone/get_zone_list.handler",
		// 	link: [zone_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:Scan"],
		// 			resources: [zone_table.arn],
		// 		},
		// 	],
		// });

		// const update_zone = new sst.aws.Function("Update-Zone", {
		// 	handler: "./src/zone/update_zone.handler",
		// 	link: [zone_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:PutItem"],
		// 			resources: [zone_table.arn],
		// 		},
		// 	],
		// });

		// const create_plant_record = new sst.aws.Function("Create-Plant-Record", {
		// 	handler: "./src/plant_record/create_plant_record.handler",
		// 	link: [plant_record_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:PutItem"],
		// 			resources: [plant_record_table.arn],
		// 		},
		// 	],
		// });

		// const delete_plant_record = new sst.aws.Function("Delete-Plant-Record", {
		// 	handler: "./src/plant_record/delete_plant_record.handler",
		// 	link: [plant_record_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:DeleteItem"],
		// 			resources: [plant_record_table.arn],
		// 		},
		// 	],
		// });

		// const get_plant_record = new sst.aws.Function("Get-Plant-Record", {
		// 	handler: "./src/plant_record/get_plant_record.handler",
		// 	link: [plant_record_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:GetItem"],
		// 			resources: [plant_record_table.arn],
		// 		},
		// 	],
		// });

		// const get_plant_record_list = new sst.aws.Function(
		// 	"Get-Plant-Record-List",
		// 	{
		// 		handler: "./src/plant_record/get_plant_record_list.handler",
		// 		link: [plant_record_table],
		// 		environment: {
		// 			DEBUG: "true",
		// 		},
		// 		url: true,
		// 		permissions: [
		// 			{
		// 				actions: ["dynamodb:Scan"],
		// 				resources: [plant_record_table.arn],
		// 			},
		// 		],
		// 	},
		// );

		// const update_plant_record = new sst.aws.Function("Update-Plant-Record", {
		// 	handler: "./src/plant_record/update_plant_record.handler",
		// 	link: [plant_record_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:PutItem"],
		// 			resources: [plant_record_table.arn],
		// 		},
		// 	],
		// });

		// const get_schedule = new sst.aws.Function("Get-Schedule", {
		// 	handler: "./src/schedule/get_schedule.handler",
		// 	link: [plant_table, zone_table, plant_record_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:Scan"],
		// 			resources: [plant_record_table.arn],
		// 		},
		// 	],
		// });

		// const get_scoreboard = new sst.aws.Function("Get-Scoreboard", {
		// 	handler: "./src/scoreboard/get_scoreboard.handler",
		// 	link: [plant_record_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:Scan"],
		// 			resources: [plant_record_table.arn],
		// 		},
		// 	],
		// });

		// const get_employees = new sst.aws.Function("Get-Employees", {
		// 	handler: "./src/employee/get_employees.handler",
		// 	link: [plant_table, zone_table, plant_record_table],
		// 	environment: {
		// 		DEBUG: "true",
		// 	},
		// 	url: true,
		// 	permissions: [
		// 		{
		// 			actions: ["dynamodb:Scan"],
		// 			resources: [plant_record_table.arn],
		// 		},
		// 	],
		// });
	},
});
