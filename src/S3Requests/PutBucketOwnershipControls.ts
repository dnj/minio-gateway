import Action from "./Action";

export default class PutBucketOwnershipControls extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		ownershipControls: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}