import Action from "./Action";

export default class UploadPart extends Action {
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
		uploadId: {
			required: true,
			place: "url",
		},
		partNumber: {
			required: true,
			place: "url",
		},
	};
}