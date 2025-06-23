type RequestCommon<OP extends string> = {
	requestName: OP;
	code: number;
	message: string;
};

export type RequestFail<OP extends string> = RequestCommon<OP> & {
	success: false;
};

export type RequestSuccess<OP extends string, T> = RequestCommon<OP> & {
	success: true;
	data: T;
};

export type RequestResult<OP extends string, T> =
	| RequestSuccess<OP, T>
	| RequestFail<OP>;

export const createRequestFail =
	<const OP extends string>(requestName: OP) =>
	(code: number, message: string): RequestFail<OP> => ({
		success: false,
		requestName,
		code,
		message,
	});

export const createRequestSuccess =
	<const OP extends string>(requestName: OP) =>
	<T extends unknown>(
		data: T,
		code: number,
		message: string,
	): RequestSuccess<OP, T> => ({
		success: true,
		requestName,
		data,
		code,
		message,
	});
