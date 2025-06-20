import { createRequestFail, createRequestSuccess } from "../requests";
import { GetEmployeeNamesRequest } from "../types";

export const getEmployeeNamesRequestFunc = async (
	req: GetEmployeeNamesRequest,
) => {
	return createRequestFail(req.command)(500, "NOT YET IMPLEMENTED");
};
