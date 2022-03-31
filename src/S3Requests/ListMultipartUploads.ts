import Action from "./Action";

export default class ListMultipartUploads extends Action {
	public readonly method: string = "GET";
	public readonly parameters = {
		uploads: {
			required: true,
			place: "url",
		},
		bucket: {
			required: true,
			place: "url",
		},
	};
}