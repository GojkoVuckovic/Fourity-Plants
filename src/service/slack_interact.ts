import { WebClient } from "@slack/web-api";
import { createRequestFail, createRequestSuccess } from "@src/requests";
import { plantRecordService } from "./plant_record";

export const slackInteractService = (
  slack: WebClient,
  plantRecordServiceInstance: ReturnType<typeof plantRecordService>,
) => {
  return {
    async openCompleteTaskModal(payload: any) {
      const action = payload.actions[0];
      if (!(action.action_id === "complete-task")) {
        return createRequestFail("slack-action")(200, "unhandled action");
      }
      const triggerId = payload.trigger_id;
      const originalMessageTs = payload.message?.ts;
      const channelId = payload.channel?.id;
      const userId = payload.user?.id;
      const buttonData = JSON.parse(action.value);
      const taskUuid = buttonData.uuid;
      const assignedEmployeeName = buttonData.employeeName;
      console.log(assignedEmployeeName);
      if (assignedEmployeeName != payload.user.username) {
        try {
          await slack.chat.postEphemeral({
            channel: payload.channel.id,
            user: payload.user.id,
            text: `⚠️ This task is assigned to *${assignedEmployeeName}*. Only they can complete it.\n\nYou are logged in as *${payload.user.username}*.`,
          });
        } catch (error) {
          console.error("Error sending ephemeral message:", error);
        }

        return createRequestSuccess("slack-request")("", 200, "");
      }

      const replyThreadTs = payload.message?.thread_ts || originalMessageTs;

      if (
        !triggerId ||
        !originalMessageTs ||
        !channelId ||
        !userId ||
        !replyThreadTs ||
        !taskUuid
      ) {
        createRequestFail("slack-request")(200, "missing parameters");
      }
      const privateMetadata = JSON.stringify({
        original_message_ts: originalMessageTs,
        channel_id: channelId,
        reply_thread_ts: replyThreadTs,
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
        console.log("Modal opened successfully.");
      } catch (modalError) {
        console.error("Error opening modal:", modalError);
      }
      return createRequestSuccess("slack-request")("", 200, "");
    },
    async resolveCompleteRequestModal(payload: any) {
      const additionalInfo =
        payload.view.state.values["additional-info-block"]?.[
          "additional-info-input"
        ]?.value;
      const privateMetadata = JSON.parse(payload.view.private_metadata);
      const taskUuid = privateMetadata.task_uuid;
      const channelId = privateMetadata.channel_id;

      console.log("Completing task:", taskUuid);
      console.log("Additional info:", additionalInfo);

      const result = await plantRecordServiceInstance.completeTask(
        taskUuid,
        additionalInfo,
      );
      console.log(result.message);
      if (!result.success) {
        if (result.message === "task_already_completed") {
          try {
            await slack.chat.postEphemeral({
              channel: channelId,
              user: payload.user.id,
              text: `🎉 Good news! This task has already been completed`,
            });
            return createRequestSuccess("slack-request")("", 200, "");
          } catch (error) {
            console.error("Error sending ephemeral message:", error);
          }
        }
        return result;
      }
      try {
        await slack.chat.postEphemeral({
          channel: channelId,
          user: payload.user.id,
          text: `✅ Task completed successfully!`,
        });
      } catch (error) {
        console.error("Error sending ephemeral message:", error);
      }

      return createRequestSuccess("slack-request")("", 200, "");
    },
  };
};
