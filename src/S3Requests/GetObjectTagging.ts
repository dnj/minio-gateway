import Action from "./Action";

export default class GetObjectTagging extends Action {
	public readonly method: string = "GET";
	public readonly parameters = {
		tagging: {
			required: true,
			place: "url",
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
		"x-amz-request-payer": {
			required: false,
			place: "header",
		},
	};
}