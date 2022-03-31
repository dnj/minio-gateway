import Action from "./Action";

export default class PutBucketLifecycleConfiguration extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		lifecycle: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}