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

		const create_plant_type = new sst.aws.Function("Create-Plant-Type", {
			handler: "./src/plant_type/create_plant_type.handler",
			link: [plant_type_table],
			environment: {
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
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
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
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
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
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
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
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
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:*"],
					resources: [plant_type_table.arn],
				},
			],
		});

		const create_plant = new sst.aws.Function("Create-Plant", {
			handler: "./src/plant/create_plant.handler",
			link: [plant_table, plant_type_table, zone_table],
			environment: {
				PLANT_TABLE_NAME: plant_table.name,
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
				ZONE_TABLE_NAME: zone_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:PutItem"],
					resources: [plant_table.arn],
				},
			],
		});

		const delete_plant = new sst.aws.Function("Delete-Plant", {
			handler: "./src/plant/delete_plant.handler",
			link: [plant_table],
			environment: {
				PLANT_TABLE_NAME: plant_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:DeleteItem"],
					resources: [plant_table.arn],
				},
			],
		});

		const get_plant = new sst.aws.Function("Get-Plant", {
			handler: "./src/plant/get_plant.handler",
			link: [plant_table],
			environment: {
				PLANT_TABLE_NAME: plant_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:GetItem"],
					resources: [plant_table.arn],
				},
			],
		});

		const get_plant_list = new sst.aws.Function("Get-Plant-List", {
			handler: "./src/plant/get_plant_list.handler",
			link: [plant_table],
			environment: {
				PLANT_TABLE_NAME: plant_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:Scan"],
					resources: [plant_table.arn],
				},
			],
		});

		const update_plant = new sst.aws.Function("Update-Plant", {
			handler: "./src/plant/update_plant.handler",
			link: [plant_table, plant_type_table, zone_table],
			environment: {
				PLANT_TABLE_NAME: plant_table.name,
				PLANT_TYPE_TABLE_NAME: plant_type_table.name,
				ZONE_TABLE_NAME: zone_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:PutItem"],
					resources: [plant_table.arn],
				},
			],
		});

		const create_zone = new sst.aws.Function("Create-Zone", {
			handler: "./src/zone/create_zone.handler",
			link: [zone_table],
			environment: {
				ZONE_TABLE_NAME: zone_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:PutItem"],
					resources: [zone_table.arn],
				},
			],
		});

		const delete_zone = new sst.aws.Function("Delete-Zone", {
			handler: "./src/zone/delete_zone.handler",
			link: [zone_table],
			environment: {
				ZONE_TABLE_NAME: zone_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:DeleteItem"],
					resources: [zone_table.arn],
				},
			],
		});

		const get_zone = new sst.aws.Function("Get-Zone", {
			handler: "./src/zone/get_zone.handler",
			link: [zone_table],
			environment: {
				ZONE_TABLE_NAME: zone_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:GetItem"],
					resources: [zone_table.arn],
				},
			],
		});

		const get_zone_list = new sst.aws.Function("Get-Zone-List", {
			handler: "./src/zone/get_zone_list.handler",
			link: [zone_table],
			environment: {
				ZONE_TABLE_NAME: zone_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:Scan"],
					resources: [zone_table.arn],
				},
			],
		});

		const update_zone = new sst.aws.Function("Update-Zone", {
			handler: "./src/zone/update_zone.handler",
			link: [zone_table],
			environment: {
				ZONE_TABLE_NAME: zone_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:PutItem"],
					resources: [zone_table.arn],
				},
			],
		});

		const get_plant_record_list = new sst.aws.Function(
			"Get-Plant-Record-List",
			{
				handler: "./src/plant_record/get_plant_record_list.handler",
				link: [plant_record_table],
				environment: {
					PLANT_RECORD_TABLE_NAME: plant_record_table.name,
				},
				permissions: [
					{
						actions: ["dynamodb:Scan"],
						resources: [plant_record_table.arn],
					},
				],
			},
		);

		const update_plant_record = new sst.aws.Function("Update-Plant-Record", {
			handler: "./src/plant_record/update_plant_record.handler",
			link: [plant_record_table],
			environment: {
				PLANT_RECORD_TABLE_NAME: plant_record_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:PutItem"],
					resources: [plant_record_table.arn],
				},
			],
		});

		const get_schedule = new sst.aws.Function("Get-Schedule", {
			handler: "./src/schedule/get_schedule.handler",
			link: [plant_record_table],
			environment: { PLANT_RECORD_TABLE_NAME: plant_record_table.name },
			permissions: [
				{
					actions: ["dynamodb:Scan"],
					resources: [plant_record_table.arn],
				},
			],
		});

		const create_schedule = new sst.aws.Function("Create-Schedule", {
			handler: "./src/schedule/create_schedule.handler",
			link: [plant_record_table],
			environment: { PLANT_RECORD_TABLE_NAME: plant_record_table.name },
			permissions: [
				{
					actions: ["dynamodb:PutItem"],
					resources: [plant_record_table.arn],
				},
			],
		});

		const get_scoreboard = new sst.aws.Function("Get-Scoreboard", {
			handler: "./src/scoreboard/get_scoreboard.handler",
			link: [plant_record_table],
			environment: {
				PLANT_RECORD_TABLE_NAME: plant_record_table.name,
			},
			permissions: [
				{
					actions: ["dynamodb:Scan"],
					resources: [plant_record_table.arn],
				},
			],
		});

		const get_employees = new sst.aws.Function("Get-Employees", {
			handler: "./src/employee/get_employees.handler",
		});

		const dispatcher = new sst.aws.Function("Dispatcher", {
			handler: "./src/dispatcher.handler",
			url: true,
			environment: {
				PLANT_TYPE_CREATE_ARN: create_plant_type.arn,
				PLANT_TYPE_DELETE_ARN: delete_plant_type.arn,
				PLANT_TYPE_GET_ARN: get_plant_type.arn,
				PLANT_TYPE_LIST_ARN: get_plant_type_list.arn,
				PLANT_TYPE_UPDATE_ARN: update_plant_type.arn,
				PLANT_CREATE_ARN: create_plant.arn,
				PLANT_DELETE_ARN: delete_plant.arn,
				PLANT_GET_ARN: get_plant.arn,
				PLANT_LIST_ARN: get_plant_list.arn,
				PLANT_UPDATE_ARN: update_plant.arn,
				ZONE_CREATE_ARN: create_zone.arn,
				ZONE_DELETE_ARN: delete_zone.arn,
				ZONE_GET_ARN: get_zone.arn,
				ZONE_LIST_ARN: get_zone_list.arn,
				ZONE_UPDATE_ARN: update_zone.arn,
				PLANT_RECORD_LIST_ARN: get_plant_record_list.arn,
				PLANT_RECORD_UPDATE_ARN: update_plant_record.arn,
				SCHEDULE_CREATE_ARN: create_schedule.arn,
				SCHEDULE_GET_ARN: get_schedule.arn,
				SCOREBOARD_GET_ARN: get_scoreboard.arn,
				EMPLOYEE_GET_ARN: get_employees.arn,
			},
			transform: {
				role: (args) => {
					const allTargetArns = [
						create_plant_type.arn,
						delete_plant_type.arn,
						get_plant_type.arn,
						get_plant_type_list.arn,
						update_plant_type.arn,
						create_plant.arn,
						delete_plant.arn,
						get_plant.arn,
						get_plant_list.arn,
						update_plant.arn,
						create_zone.arn,
						delete_zone.arn,
						get_zone.arn,
						get_zone_list.arn,
						update_zone.arn,
						get_plant_record_list.arn,
						update_plant_record.arn,
						create_schedule.arn,
						get_schedule.arn,
						get_scoreboard.arn,
						get_employees.arn,
					];
					args.inlinePolicies = [
						{
							name: "InvokeOtherLambdas",
							policy: pulumi.all(allTargetArns).apply((resolvedArnsArray) => {
								return JSON.stringify({
									Version: "2012-10-17",
									Statement: [
										{
											Action: "lambda:InvokeFunction",
											Resource: resolvedArnsArray,
											Effect: "Allow",
										},
									],
								});
							}),
						},
					];
				},
			},
		});
	},
});
