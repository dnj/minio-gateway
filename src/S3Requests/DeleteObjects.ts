import Action from "./Action";

export default class DeleteObjects extends Action {
	public readonly method: string = "POST";
	public readonly parameters = {
		delete: {
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