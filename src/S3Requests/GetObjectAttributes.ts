import Action from "./Action";

export default class GetObjectAttributes extends Action {
	public readonly method: string = "GET";
	public readonly parameters = {
		bucket: {
			required: true,
			place: "url",
		},
		key: {
			required: true,
			place: "url",
		},
		attributes:{ 
			required: true,
			place: "url",
		},
		"partNumber": {
			required: false,
			place: "url",
		},
		versionId: {
			required: false,
			place: "url",
		},
		"x-amz-max-parts": {
			required: false,
			place: "header",
		},
		"x-amz-part-number-marker": {
			required: false,
			place: "header",
		},
		"x-amz-expected-bucket-owner": {
			required: false,
			place: "header",
		},
		"x-amz-request-payer": {
			required: false,
			place: "header",
		},
		"x-amz-server-side-encryption-customer-algorithm": {
			required: false,
			place: "header",
		},
		"x-amz-server-side-encryption-customer-key": {
			required: false,
			place: "header",
		},
		"x-amz-server-side-encryption-customer-key-MD5": {
			required: false,
			place: "header",
		},
		"x-amz-object-attributes": {
			required: true,
			place: "header",
		},
	};
}