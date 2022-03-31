import Action from "./Action";

export default class DeleteBucketAnalyticsConfiguration extends Action {
	public readonly method: string = "DELETE";
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
		"x-amz-expected-bucket-owner": {
			required: false,
			place: "header"
		},
	};
}