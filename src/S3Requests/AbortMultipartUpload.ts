import Action from "./Action";

export default class AbortMultipartUpload extends Action {
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
		uploadId: {
			required: true,
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