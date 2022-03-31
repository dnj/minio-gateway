import Action from "./Action";

export default class DeleteBucket extends Action {
	public readonly method: string = "DELETE";
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