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
			region: "eu-central-1",
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

		const table = new sst.aws.Dynamo("Table", {
			fields: {
				PK: "string",
				uuid: "string",
				type: "string",
				GSI: "string",
			},
			primaryIndex: { hashKey: "PK", rangeKey: "uuid" },
			globalIndexes: {
				TypeIndex: { hashKey: "type", rangeKey: "uuid" },
				GSIndex: { hashKey: "GSI", rangeKey: "uuid" },
			},
		});

		const dispatcher = new sst.aws.Function("Dispatcher", {
			handler: "./src/dispatcher.handler",
			link: [table],
			url: true,
			environment: {
				TABLE_NAME: table.name,
			},
		});
	},
});
