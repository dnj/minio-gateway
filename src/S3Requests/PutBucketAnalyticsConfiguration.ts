import Action from "./Action";

export default class PutBucketAnalyticsConfiguration extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		analytics: {
			required: true,
			place: "url"
		},
		id: {
			required: true,
			place: "url"
		},
		bucket: {
			required: true,
			place: "url"
		},
	};
}