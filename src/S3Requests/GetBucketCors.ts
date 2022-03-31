import Action from "./Action";

export default class GetBucketCors extends Action {
	public readonly method: string = "GET";
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