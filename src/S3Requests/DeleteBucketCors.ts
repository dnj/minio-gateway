import Action from "./Action";

export default class DeleteBucketCors extends Action {
	public readonly method: string = "DELETE";
	public readonly parameters = {
		cors: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
		"x-amz-expected-bucket-owner": {
			required: false,
			place: "header",
		},
	};
}