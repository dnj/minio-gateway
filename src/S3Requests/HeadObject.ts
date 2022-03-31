import Action from "./Action";

export default class HeadObject extends Action {
	public readonly method: string = "HEAD";
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