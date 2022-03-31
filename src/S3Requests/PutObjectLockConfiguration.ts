import Action from "./Action";

export default class PutObjectLockConfiguration extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		"object-lock": {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}