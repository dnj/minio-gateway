import Action from "./Action";

export default class PutPublicAccessBlock extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		publicAccessBlock: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}