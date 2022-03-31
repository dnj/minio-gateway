import Action from "./Action";

export default class DeleteObject extends Action {
	public readonly method: string = "DELETE";
	public readonly parameters = {
		bucket: {
			required: true,
			place: "url",
		},
		key: {
			required: true,
			place: "url",
		},
		versionId: {
			required: false,
			place: "url",
		},
		"x-amz-expected-bucket-owner": {
			required: false,
			place: "header",
		},
	};
}