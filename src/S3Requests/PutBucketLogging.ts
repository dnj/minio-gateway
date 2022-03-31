import Action from "./Action";

export default class PutBucketLogging extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		logging: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}