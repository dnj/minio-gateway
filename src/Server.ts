import * as http from "http";
import ConfigRepository from "./ConfigRepository";
import RequestIdeafinder from "./RequestIdeafinder";
import { GetObject, PutObject } from "./S3Requests";
import Upstream from "./Upstream";

export default class Server {
	protected httpServer: http.Server;
	private requestIdeafinder: RequestIdeafinder;

	public constructor(protected config: ConfigRepository) {
		this.httpServer = new http.Server(this.requestHandler.bind(this));
		this.requestIdeafinder = new RequestIdeafinder();
	}
	public listen() {
		let {port, address} = this.config.getHttpServerConfig();
		if (!address) {
			address = "127.0.0.1";
		}
		this.httpServer.listen(port, address);

		console.log(`Server running on http://${address}:${port}`);
	}

	protected async requestHandler(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
		const canProxyToPeers = this.canProxyToPeers(request);
		const action = this.requestIdeafinder.findAction(request, this.config.getMainEndpoint());
		const primaryUpstream = this.config.getPrimaryUpstream();

		if (action !== undefined) {
			action.request = undefined;
			console.log("action = ", action);
			action.request = request;
		} else {
			console.log("action = ", action);
		}

		if (canProxyToPeers) {
			if (action !== undefined && action instanceof GetObject) {
				if (!await primaryUpstream.hasObject(action.bucket, action.key)) {
					this.proxyToPeers(action, response);
					return;
				}
			}
		}
		primaryUpstream.proxyWithResponse(action || request, response);
	}

	protected async proxyToPeers(action: GetObject, response: http.ServerResponse) {
		const checkLatter: Upstream[] = [];
		for (const upstream of this.config.getUpstreams(false)) {
			const check = upstream.hasObjectOffline(action.bucket, action.key);
			if (check === true) {
				await upstream.proxyWithResponse(action, response);
				return;
			} else if (check === undefined) {
				checkLatter.push(upstream);
			}
		}
		for (const upstream of checkLatter) {
			if (await upstream.hasObject(action.bucket, action.key)) {
				await upstream.proxyWithResponse(action, response);
				return;
			}
		}
		await this.config.getPrimaryUpstream().proxyWithResponse(action, response);
	}

	protected canProxyToPeers(request: http.IncomingMessage): boolean {
		return request.headers["x-gateway-no-proxy"] === undefined;
	}
}