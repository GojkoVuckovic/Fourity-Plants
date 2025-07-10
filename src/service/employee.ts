import { createRequestSuccess, RequestResult } from "../requests";
import { GetEmployeeNamesRequest } from "../types";
import { WebClient } from "@slack/web-api";
import { processRequest } from "./utils";

export const employeeService = (slack: WebClient) => {
  return {
    async getEmployeeNames(
      req: GetEmployeeNamesRequest,
    ): Promise<RequestResult<"getEmployeeNames", string[]>> {
      const employeeNames: string[] = [];
      const membersResponse = async () => {
        return await slack.conversations.members(req.payload);
      };
      const getMembersResult = await processRequest(
        membersResponse,
        req.command,
      );
      if (!getMembersResult.success) {
        return getMembersResult;
      }
      const memberIds = getMembersResult.data.members || [];
      for (const member of memberIds) {
        const userInfoResponse = async () => {
          return await slack.users.info({ user: member });
        };
        const userInfoResult = await processRequest(
          userInfoResponse,
          req.command,
        );
        if (!userInfoResult.success) {
          return userInfoResult;
        }
        const userName =
          userInfoResult.data.user?.name ||
          userInfoResult.data.user?.profile?.display_name ||
          userInfoResult.data.user?.real_name;
        if (userName && !userInfoResult.data.user?.is_bot) {
          employeeNames.push(userName);
        }
      }
      return createRequestSuccess(req.command)(employeeNames, 200, "");
    },
  };
};
