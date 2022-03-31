import { SortedSet } from "@shlappas/sorted-set";
import * as http from "http";
import * as https from "https";
import * as Minio from "minio";
import MinioClient from "./MinIOClient";
import { GetObject } from "./S3Requests";
import Action from "./S3Requests/Action";

export default class Upstream {
	protected client?: Minio.Client;

	public presentObjects: SortedSet<string>;
	public absentObjects: SortedSet<string>;

	public constructor(
		protected url: URL,
		protected accessKey: string,
		protected secretKey: string,
	) {

		this.presentObjects = new SortedSet();
		this.absentObjects = new SortedSet();
	}

	public requestFromRequest(request: http.IncomingMessage) {
		const headers = Object.assign({}, request.headers);
		if (headers["x-forwarded-for"] === undefined) {
			headers["x-forwarded-for"] = request.socket.remoteAddress;
		}
		if (headers["x-forwarded-host"] === undefined) {
			headers["x-forwarded-host"] = request.headers.host;
		}
		delete headers["host"];
		headers["x-gateway-no-proxy"] = "true";


		let handler: typeof http | typeof https = http;
		if (this.url.protocol === "https:") {
			handler = https;
		}
		
		return handler.request({
			hostname: this.url.hostname,
			port: this.url.port,
			path: request.url,
			method: request.method,
			protocol: this.url.protocol,
			headers: headers,
		});
	}

	public proxyRequest(incoming: http.IncomingMessage): Promise<http.IncomingMessage> {
		return new Promise((resolve, reject) => {
			const request = this.requestFromRequest(incoming);
			request.on("error", reject);
			request.on("response", resolve);
			incoming.pipe(request);
		});
	}

	public async proxy(incoming: Action | http.IncomingMessage): Promise<http.IncomingMessage> {
		let action: Action|undefined;
		if (incoming instanceof Action) {
			if (incoming.request === undefined) {
				throw new Error("Action request is empty");
			}
			action = incoming;
			incoming = incoming.request;
		}
		const response = await this.proxyRequest(incoming);
		if (response.statusCode === undefined) {
			throw new Error();
		}
		if (action !== undefined) {
			if (action instanceof GetObject) {
				if (response.statusCode >= 200 && response.statusCode < 400) {
					this.addPresentObject(action.bucket, action.key);
				} else if (response.statusCode === 404) {
					this.addAbsentObject(action.bucket, action.key);
				}
			}
		}
		return response;
	}

	public async proxyWithResponse(incoming: Action | http.IncomingMessage, client: http.ServerResponse) {
		const upstream = await this.proxy(incoming);
		if (upstream.statusCode === undefined) {
			throw new Error("status code is empty");
		}
		client.writeHead(upstream.statusCode, upstream.statusMessage, upstream.headers);
		upstream.pipe(client);
	}

	public getClient(): Minio.Client {
		if (this.client !== null) {
			this.client = new MinioClient({
				endPoint: this.url.hostname,
				accessKey: this.accessKey,
				secretKey: this.secretKey,
				useSSL: this.url.protocol === "https"
			});
		}
		return this.client;
	}

	public hasObjectOffline(bucket: string, key: string): boolean|undefined {
		if (this.presentObjects.has(`${bucket}/${key}`)) {
			return true;
		}
		if (this.absentObjects.has(`${bucket}/${key}`)) {
			return false;
		}
		return undefined;
	}

	public addPresentObject(bucket: string, key: string): void {
		this.presentObjects.add(`${bucket}/${key}`);
		this.removeAbsentObject(bucket, key);
	}
	public removePresentObject(bucket: string, key: string): void {
		if (this.presentObjects.has(`${bucket}/${key}`)) {
			this.presentObjects.delete(`${bucket}/${key}`);
		}
		console.log({
			url: this.url.toString(),
			presentObjects: [...this.presentObjects.values()],
			absentObjects: [...this.absentObjects.values()],
		});
	}

	public addAbsentObject(bucket: string, key: string): void {
		this.absentObjects.add(`${bucket}/${key}`);
		this.removePresentObject(bucket, key);
	}
	public removeAbsentObject(bucket: string, key: string): void {
		if (this.absentObjects.has(`${bucket}/${key}`)) {
			this.absentObjects.delete(`${bucket}/${key}`);
		}

		console.log({
			url: this.url.toString(),
			presentObjects: [...this.presentObjects.values()],
			absentObjects: [...this.absentObjects.values()],
		});
	}

	public async hasObject(bucket: string, key: string): Promise<boolean> {
		const offline = this.hasObjectOffline(bucket, key);
		if (offline !== undefined) {
			return offline;
		}
		const client = this.getClient();
		try {
			console.log(`asking about ${bucket}/${key} from upstream ${this.url.toString()}`);
			await client.statObject(bucket, key);
			this.addPresentObject(bucket, key);
			return true;
		} catch (e) {
			this.addAbsentObject(bucket, key);
			return false;
		}
	}
}
