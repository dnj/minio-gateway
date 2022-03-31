import Action from "./Action";

export default class PutObjectAcl extends Action {
	public readonly method: string = "PUT";
	public readonly parameters = {
		acl: {
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