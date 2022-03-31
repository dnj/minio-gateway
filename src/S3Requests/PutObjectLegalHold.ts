import Action from "./Action";

export default class PutObjectLegalHold extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		"legal-hold": {
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
		}
	};
}