import Action from "./Action";

export default class ListBuckets extends Action {
	public readonly method: string = "GET";
	public readonly parameters = {};
}