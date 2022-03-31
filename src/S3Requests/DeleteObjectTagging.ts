import Action from "./Action";

export default class DeleteObjectTagging extends Action {
	public readonly method: string = "DELETE";
	public readonly parameters = {
		tagging: {
			required: true,
			place: "url"
		},
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