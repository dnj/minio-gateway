import Action from "./Action";

export default class PutBucketCors extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		cors: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}