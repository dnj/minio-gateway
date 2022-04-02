import * as http from 'http';
import ConfigRepository from './ConfigRepository';
import RequestIdeafinder from './RequestIdeafinder';
import { GetObject, PutObject } from './S3Requests';
import Upstream from './Upstream';
import Admin from './admin';

export default class Server {
  protected httpServer: http.Server;

  private requestIdeafinder: RequestIdeafinder;

  private admin?: Admin;

  public constructor(protected config: ConfigRepository) {
    this.httpServer = new http.Server(this.requestHandler.bind(this));
    this.requestIdeafinder = new RequestIdeafinder();
    if (this.config.getAdminAccess() !== undefined) {
      this.admin = new Admin(this.config);
    }
  }

  public listen() {
    let { port, address } = this.config.getHttpServerConfig();
    if (!address) {
      address = '127.0.0.1';
    }
    this.httpServer.listen(port, address);

    console.log(`Server running on http://${address}:${port}`);
  }

  protected async requestHandler(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    if (this.admin !== undefined && request.url?.startsWith('/minio-gateway/admin')) {
      (this.admin.getApp() as any).handle(request, response);
      return;
    }
    const canProxyToPeers = this.canProxyToPeers(request);
    const action = this.requestIdeafinder.findAction(request, this.config.getMainEndpoint());
    const primaryUpstream = this.config.getPrimaryUpstream();

    if (process.env.NODE_ENV !== 'production') {
      if (action !== undefined) {
        action.request = undefined;
        console.log({
          url: request.url,
          action,
        });
        action.request = request;
      } else {
        console.log({
          url: request.url,
          action,
        });
      }
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
      } if (check === undefined) {
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
    return request.headers['x-gateway-no-proxy'] === undefined;
  }
}
