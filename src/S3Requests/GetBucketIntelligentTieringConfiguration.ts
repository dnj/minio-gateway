import Action from "./Action";

export default class GetBucketIntelligentTieringConfiguration extends Action {
	public readonly method: string = "GET";
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