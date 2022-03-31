import Action from "./Action";

export default class DeleteBucketIntelligentTieringConfiguration extends Action {
	public readonly method: string = "DELETE";
	public readonly parameters = {
		"intelligent-tiering": {
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