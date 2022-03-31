import Action from "./Action";

export default class HeadBucket extends Action {
	public readonly method: string = "HEAD";
	public readonly parameters = {
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