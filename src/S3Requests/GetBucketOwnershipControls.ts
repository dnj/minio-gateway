import Action from "./Action";

export default class GetBucketOwnershipControls extends Action {
	public readonly method: string = "GET";
	public readonly parameters = {
		ownershipControls: {
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