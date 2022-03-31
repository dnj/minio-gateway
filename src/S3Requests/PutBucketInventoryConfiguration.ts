import Action from "./Action";

export default class PutBucketInventoryConfiguration extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		inventory: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
		id: {
			required: true,
			place: "url",
		},
	};
}