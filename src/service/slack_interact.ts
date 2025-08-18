import { WebClient } from "@slack/web-api";
import {
  createRequestFail,
  createRequestSuccess,
  RequestResult,
} from "@src/requests";
import { plantRecordService } from "./plant_record";
import {
  createScoreboardMessage,
  createSlackMessage,
  processRequest,
} from "./utils";
import { scoreboardService } from "./scoreboard";
import { z } from "zod";
import {
  DelegateTaskRequest,
  OpenCompleteRequestModalRequest,
  ResolveCompleteRequestModalRequest,
} from "@src/types";

const CHANNEL_ID = process.env.CHANNEL_ID || "";

const openCompleteTaskModalActionSchema = z.object({
  uuid: z.string(),
  employeeName: z.string(),
});

export const openCompleteTaskModalPayloadSchema = z.object({
  trigger_id: z.string(),
  message: z.object({
    ts: z.string(),
  }),
  channel: z.object({
    id: z.string(),
  }),
  user: z.object({
    id: z.string(),
    username: z.string(),
  }),
  actions: z.array(
    z.object({
      value: z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val);
          return openCompleteTaskModalActionSchema.parse(parsed);
        } catch (e) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid JSON or structure in actions[0].value",
          });
          return z.NEVER;
        }
      }),
    }),
  ),
});

export type OpenCompleteTaskModalPayload = z.infer<
  typeof openCompleteTaskModalPayloadSchema
>;

const privateMetadataSchema = z
  .object({
    task_uuid: z.string(),
  })
  .passthrough();

export const resolveCompleteRequestModalPayloadSchema = z.object({
  view: z.object({
    state: z.object({
      values: z.object({
        "additional-info-block": z.object({
          "additional-info-input": z.object({
            value: z.string().optional().nullable(),
          }),
        }),
      }),
    }),
    private_metadata: z.string().transform((val, ctx) => {
      try {
        const parsed = JSON.parse(val);
        return privateMetadataSchema.parse(parsed);
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON or structure in actions[0].value",
        });
        return z.NEVER;
      }
    }),
    callback_id: z.string(),
  }),
  user: z.object({
    id: z.string(),
  }),
});

export type ResolveCompleteRequestModalPayload = z.infer<
  typeof resolveCompleteRequestModalPayloadSchema
>;

const actionValueSchema = z.object({
  uuid: z.string(),
  employeeName: z.string(),
  plantName: z.string(),
});

export const delegateTaskPayloadSchema = z.object({
  message: z.object({
    ts: z.string(),
  }),
  actions: z.array(
    z.object({
      value: z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val);
          return actionValueSchema.parse(parsed);
        } catch (e) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid JSON or structure in actions[0].value",
          });
          return z.NEVER;
        }
      }),
    }),
  ),
  user: z.object({
    username: z.string(),
    id: z.string(),
  }),
});

export type DelegateTaskPayload = z.infer<typeof delegateTaskPayloadSchema>;

export const slackInteractService = (
  slack: WebClient,
  plantRecordServiceInstance: ReturnType<typeof plantRecordService>,
  scoreboardServiceInstance: ReturnType<typeof scoreboardService>,
) => {
  return {
    async openCompleteTaskModal(
      payload: OpenCompleteRequestModalRequest,
    ): Promise<RequestResult<"complete-task-modal", string>> {
      const triggerId = payload.payload.trigger_id;
      const originalMessageTs = payload.payload.message?.ts;
      const channelId = payload.payload.channel?.id;
      const userId = payload.payload.user?.id;
      const buttonData = payload.payload.actions[0].value;
      const taskUuid = buttonData.uuid;
      const assignedEmployeeName = buttonData.employeeName;
      if (assignedEmployeeName != payload.payload.user.username) {
        try {
          await slack.chat.postEphemeral({
            channel: CHANNEL_ID,
            user: payload.payload.user.id,
            text: `⚠️ This task is assigned to *${assignedEmployeeName}*. Only they can complete it.\n\nYou are logged in as *${payload.payload.user.username}*.`,
          });
        } catch (error) {
          console.error("Error sending ephemeral message:", error);
        }

        return createRequestSuccess("complete-task-modal")("", 200, "");
      }

      if (
        !triggerId ||
        !originalMessageTs ||
        !channelId ||
        !userId ||
        !taskUuid
      ) {
        createRequestFail("complete-task-modal")(200, "missing parameters");
      }
      const privateMetadata = JSON.stringify({
        original_message_ts: originalMessageTs,
        channel_id: channelId,
        reply_thread_ts: originalMessageTs,
        user_id: userId,
        task_uuid: taskUuid,
        command_used: "complete-task-modal",
      });
      try {
        await slack.views.open({
          trigger_id: triggerId,
          view: {
            type: "modal",
            callback_id: "complete-task-modal",
            title: {
              type: "plain_text",
              text: `Complete task`,
            },
            private_metadata: privateMetadata,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `Do you want to add additional info?`,
                },
              },
              {
                type: "input",
                block_id: "additional-info-block",
                optional: true,
                label: {
                  type: "plain_text",
                  text: "Additional Info",
                },
                element: {
                  type: "plain_text_input",
                  action_id: "additional-info-input",
                  multiline: true,
                  placeholder: {
                    type: "plain_text",
                    text: "Enter any additional information about completing this task...or don't",
                  },
                },
              },
            ],
            submit: {
              type: "plain_text",
              text: "Submit",
            },
            close: {
              type: "plain_text",
              text: "Cancel",
            },
          },
        });
      } catch (modalError) {
        console.error("Error opening modal:", modalError);
      }
      return createRequestSuccess("complete-task-modal")("", 200, "");
    },
    async resolveCompleteRequestModal(
      payload: ResolveCompleteRequestModalRequest,
    ): Promise<RequestResult<"complete-task-resolve", string>> {
      let additionalInfo =
        payload.payload.view.state.values["additional-info-block"][
          "additional-info-input"
        ].value ?? "";
      const privateMetadata = payload.payload.view.private_metadata;
      const taskUuid = privateMetadata.task_uuid;

      const result = await plantRecordServiceInstance.completeTask(
        taskUuid,
        additionalInfo,
      );
      if (!result.success) {
        if (result.message === "task_already_completed") {
          try {
            await slack.chat.postEphemeral({
              channel: CHANNEL_ID,
              user: payload.payload.user.id,
              text: `🎉 Good news! This task has already been completed`,
            });
            return createRequestSuccess("complete-task-resolve")("", 200, "");
          } catch (error) {
            console.error("Error sending ephemeral message:", error);
          }
        }
        return result;
      }
      try {
        await slack.chat.postEphemeral({
          channel: CHANNEL_ID,
          user: payload.payload.user.id,
          text: `✅ Task completed successfully!`,
        });
      } catch (error) {
        console.error("Error sending ephemeral message:", error);
      }

      return createRequestSuccess("complete-task-resolve")("", 200, "");
    },
    async delegateTask(
      payload: DelegateTaskRequest,
    ): Promise<RequestResult<"delegate-task", string>> {
      const originalMessageTs = payload.payload.message?.ts;
      const buttonData = payload.payload.actions[0].value;
      const taskUuid = buttonData.uuid;
      const assignedEmployeeName = buttonData.employeeName;
      const plantName = buttonData.plantName;
      if (assignedEmployeeName === payload.payload.user.username) {
        try {
          await slack.chat.postEphemeral({
            channel: CHANNEL_ID,
            user: payload.payload.user.id,
            text: `You are already assigned to this task!`,
          });
          return createRequestSuccess("delegate-task")("", 200, "");
        } catch (error) {
          console.error("Error sending ephemeral message:", error);
        }
      }
      const result = await plantRecordServiceInstance.delegateTask(
        taskUuid,
        payload.payload.user.username,
        plantName,
      );
      if (!result.success) {
        return createRequestFail("delegate-task")(400, "Error delegating task");
      }
      try {
        const deleteMessageCommand = async () => {
          return await slack.chat.delete({
            channel: CHANNEL_ID,
            ts: originalMessageTs,
          });
        };
        const deleteMessageResult = await processRequest(
          deleteMessageCommand,
          "delegate-task",
        );
        if (!deleteMessageResult.success) {
          return deleteMessageResult;
        }

        const postMessageArgs = createSlackMessage(result.data, CHANNEL_ID);
        const postMessageCommand = async () => {
          return await slack.chat.postMessage(postMessageArgs);
        };
        const postMessageResult = await processRequest(
          postMessageCommand,
          "delegate-task",
        );
        if (!postMessageResult.success) {
          return postMessageResult;
        }
      } catch (error) {
        console.error("Error sending ephemeral message:", error);
      }
      return createRequestSuccess("delegate-task")("", 200, "");
    },
    async showScoreboard(): Promise<RequestResult<"show-scoreboard", string>> {
      const result = await scoreboardServiceInstance.getScoreboard();
      if (!result.success) {
        return result;
      }
      const postMessageArgs = createScoreboardMessage(result.data, CHANNEL_ID);
      const postMessageCommand = async () => {
        return await slack.chat.postMessage(postMessageArgs);
      };
      const postMessageResult = await processRequest(
        postMessageCommand,
        "show-scoreboard",
      );
      if (!postMessageResult.success) {
        return postMessageResult;
      }
      return createRequestSuccess("show-scoreboard")("", 200, "");
    },
  };
};
