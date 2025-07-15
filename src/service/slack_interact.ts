import { WebClient } from "@slack/web-api";
import { createRequestFail, createRequestSuccess } from "@src/requests";

export const slackInteractService = (slack: WebClient) => {
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
      const taskId = action.value;

      const replyThreadTs = payload.message?.thread_ts || originalMessageTs;

      if (
        !triggerId ||
        !originalMessageTs ||
        !channelId ||
        !userId ||
        !replyThreadTs ||
        !taskId
      ) {
        createRequestFail("slack-request")(200, "missing parameters");
      }
      const privateMetadata = JSON.stringify({
        original_message_ts: originalMessageTs,
        channel_id: channelId,
        reply_thread_ts: replyThreadTs,
        user_id: userId,
        task_id: taskId,
        command_used: "complete-task-modal",
      });
      try {
        await slack.views.open({
          //Here will go the modal
        });
        console.log("Modal opened successfully.");
      } catch (modalError) {
        console.error("Error opening modal:", modalError);
      }
      return createRequestSuccess("slack-request")("", 200, "");
    },
    async resolveCompleteRequestModal(payload: any) {
      return createRequestSuccess("slack-request")("", 200, "");
    },
  };
};
