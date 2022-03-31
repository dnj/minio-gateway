import { Client } from "minio"

export default class MinioClient extends Client {
	public makeRequest(options: any, payload: any, statusCodes: any, region: any, returnResponse: any, cb: any) {
		if (options === undefined) {
			options = {};
		}
		if (typeof options !== "object") {
			throw new Error();
		}
		if (options.headers === undefined) {
			options.headers = {};
		}
		if (typeof options.headers !== "object") {
			throw new Error();
		}
		options.headers["x-gateway-no-proxy"] = "true";

		return (Client as any).makeRequest.call(this, options, payload, statusCodes, region, returnResponse, cb);
	}
}