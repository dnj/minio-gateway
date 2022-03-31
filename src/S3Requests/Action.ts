import { IncomingMessage } from "http";

export default class Action {
	public readonly method: string = "";
	public readonly parameters: {
		[key: string]: {
			required?: boolean;
			place: string;
		};
	} = {};
	public request?: IncomingMessage;
	[key: string]: any;
}