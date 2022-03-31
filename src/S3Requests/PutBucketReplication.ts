import Action from "./Action";

export default class PutBucketReplication extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		replication: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}