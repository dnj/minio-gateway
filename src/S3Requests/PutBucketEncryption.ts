import Action from "./Action";

export default class PutBucketEncryption extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		encryption: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}