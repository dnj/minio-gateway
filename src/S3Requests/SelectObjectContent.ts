import Action from "./Action";

export default class SelectObjectContent extends Action {
	public readonly method: string = "POST";
	public readonly parameters = {
		select: {
			required: true,
			place: "url",
		},
		"select-type": {
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