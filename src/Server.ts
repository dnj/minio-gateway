import * as http from 'http';
import ConfigRepository from './ConfigRepository';
import RequestIdeafinder from './RequestIdeafinder';
import { GetObject, HeadObject, PutObject } from './S3Requests';
import Upstream from './Upstream';
import Admin from './admin';
import { inject, injectable } from 'tsyringe';
import { Logger } from 'winston';
import Action from './S3Requests/Action';
import ContainerHelper from './ContainerHelper';
import arrayShuffle from 'array-shuffle';

@injectable()
export default class Server {
  protected httpServer: http.Server;

  private requestIdeafinder: RequestIdeafinder;

  private admin?: Admin;

  public constructor(
    @inject(ConfigRepository) protected config: ConfigRepository,
    @inject("Logger") protected logger: Logger
  ) {
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

    this.logger.info(`Server running on http://${address}:${port}`);
  }

  protected async requestHandler(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
    if (this.admin !== undefined && request.url?.startsWith('/minio-gateway/admin')) {
      (this.admin.getApp() as any).handle(request, response);
      return;
    }
    const canProxyToPeers = this.canProxyToPeers(request);
    const action = this.requestIdeafinder.findAction(request, this.config.getMainEndpoint());
    const minio = ContainerHelper.getMinio();
    const master = ContainerHelper.getMaster();

    if (
      canProxyToPeers &&
      action !== undefined &&
      ( action instanceof GetObject || action instanceof HeadObject ) &&
      !await minio.hasObject(action.bucket, action.key)
    ) {
      this.proxyToPeers(action, response);
      return;
    }
    if (master !== undefined && request.method !== "GET" && canProxyToPeers) {
      this.logRequest(request, canProxyToPeers, action, master);
      master.proxyWithResponse(action || request, response);
      return;
    }
    this.proxyToMinio(action || request, response);
  }

  protected async proxyToPeers(action: GetObject | HeadObject, response: http.ServerResponse) {
    const upstreams = arrayShuffle(ContainerHelper.getSalves());
    const master = ContainerHelper.getMaster();
    if (master) {
      upstreams.push(master);
    }
  
    const checkLatter: Upstream[] = [];
    for (const upstream of upstreams) {
      const check = upstream.hasObjectOffline(action.bucket, action.key);
      if (check === true) {
        this.logRequest(action.request as http.IncomingMessage, true, action, upstream);
        upstream.proxyWithResponse(action, response);
        return;
      }
      if (check === undefined) {
        checkLatter.push(upstream);
      }
    }
    for (const upstream of checkLatter) {
      if (await upstream.hasObject(action.bucket, action.key)) {
        this.logRequest(action.request as http.IncomingMessage, true, action, upstream);
        upstream.proxyWithResponse(action, response);
        return;
      }
    }
  
    this.proxyToMinio(action, response);
  }

  protected canProxyToPeers(request: http.IncomingMessage): boolean {
    return request.headers['x-gateway-no-proxy'] === undefined;
  }

  protected logRequest(request: http.IncomingMessage, canProxyToPeers: boolean, action: Action | undefined, upstream: Upstream) {
    const log: Record<string, any> = {
      url: request.url,
      canProxyToPeers,
      action: action?.constructor.name,
      method: request.method,
      upstream: upstream.getURL().toString(),
      ip: request.socket.remoteAddress,
    };
    if (typeof request.headers["x-forwarded-for"] === "string") {
      log["x-forwarded-for"] = request.headers["x-forwarded-for"];
    }
    if (action !== undefined) {
      for (const key in action) {
        if (key !== "request" && key !== "method" && key !== "parameters") {
          log[key] = action[key];
        }
      }
    }
    this.logger.http(`http request`, log);
  }

  protected proxyToMinio(request: http.IncomingMessage | Action, response: http.ServerResponse) {
    const minio = ContainerHelper.getMinio();

    let action: Action|undefined;
    if (request instanceof Action) {
      action = request;
      request = request.request as http.IncomingMessage;
    }
    this.logRequest(request, false, action, minio);
    return minio.proxyWithResponse(action || request, response);
  }
}
