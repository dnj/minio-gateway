import Action from "./Action";

export default class CopyObject extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		bucket: {
			required: true,
			place: "url",
		},
		key: {
			required: true,
			place: "url",
		},
		"x-amz-copy-source": {
			required: true,
			place: "header",
		},
	};
}