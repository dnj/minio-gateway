import Action from "./Action";

export default class CompleteMultipartUpload extends Action {
	public readonly method: string = "POST";
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
		"x-amz-checksum-crc32": {
			required: false,
			place: "header",
		},
		"x-amz-checksum-crc32c": {
			required: false,
			place: "header",
		},
		"x-amz-checksum-sha1": {
			required: false,
			place: "header",
		},
		"x-amz-checksum-sha256": {
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
	};
}