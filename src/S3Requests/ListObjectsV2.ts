import Action from "./Action";

export default class ListObjectsV2 extends Action {
	public readonly method: string = "GET";
	public readonly parameters = {
		"list-type": {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}