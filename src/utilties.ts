export function getParameterCaseInsensitive<T>(object: {[key: string]: T}, key: string): T|undefined {
	const asLowercase = key.toLowerCase();
	const index = Object.keys(object).find(k => k.toLowerCase() === asLowercase);
	if (index === undefined) {
		return undefined;
	}
	return object[index];
}