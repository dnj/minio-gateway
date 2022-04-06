import { SortedSet } from '@shlappas/sorted-set';
import * as http from 'http';
import * as https from 'https';
import * as Minio from 'minio';
import CacheManager from './CacheManager';
import MinioClient from './MinIOClient';
import Action from './S3Requests/Action';
import { WorkQueue } from './WorkQueue';

export default class Upstream {
  protected client?: Minio.Client;

  public presentObjects: SortedSet<string>;

  public absentObjects: SortedSet<string>;

  public readonly workQueue: WorkQueue;

  public constructor(
    protected url: URL,
    protected accessKey: string,
    protected secretKey: string,
    protected region: string,
    protected cacheManager: CacheManager,
  ) {
    this.presentObjects = new SortedSet();
    this.absentObjects = new SortedSet();
    this.workQueue = new WorkQueue(this);
  }

  public requestFromRequest(request: http.IncomingMessage) {
    const headers = { ...request.headers };
    if (headers['x-forwarded-for'] === undefined) {
      headers['x-forwarded-for'] = request.socket.remoteAddress;
    }
    if (headers['x-forwarded-host'] === undefined) {
      headers['x-forwarded-host'] = request.headers.host;
    }
    headers['x-gateway-no-proxy'] = 'true';

    let handler: typeof http | typeof https = http;
    if (this.url.protocol === 'https:') {
      handler = https;
    }

    return handler.request({
      hostname: this.url.hostname,
      port: this.url.port,
      path: request.url,
      method: request.method,
      protocol: this.url.protocol,
      setHost: false,
      headers,
    });
  }

  public proxyRequest(incoming: http.IncomingMessage): Promise<http.IncomingMessage> {
    return new Promise((resolve, reject) => {
      const request = this.requestFromRequest(incoming);
      request.on('error', reject);
      request.on('response', resolve);
      incoming.pipe(request);
    });
  }

  public async proxy(incoming: Action | http.IncomingMessage): Promise<http.IncomingMessage> {
    let action: Action | undefined;
    if (incoming instanceof Action) {
      if (incoming.request === undefined) {
        throw new Error('Action request is empty');
      }
      action = incoming;
      incoming = incoming.request;
    }
    const response = await this.proxyRequest(incoming);
    if (response.statusCode === undefined) {
      throw new Error();
    }
    if (action !== undefined) {
      const promise = this.cacheManager.handleResponse(this, action, response);
      if (promise !== undefined) {
        await Promise.race([
          new Promise((resolve) => setTimeout(resolve, 30 * 1000)),
          promise,
        ]);
      }
    }
    return response;
  }

  public async proxyWithResponse(incoming: Action | http.IncomingMessage, client: http.ServerResponse) {
    const upstream = await this.proxy(incoming);
    if (upstream.statusCode === undefined) {
      throw new Error('status code is empty');
    }
    client.writeHead(upstream.statusCode, upstream.statusMessage, upstream.headers);
    upstream.pipe(client);
  }

  public getClient(): Minio.Client {
    if (this.client !== null) {
      this.client = new MinioClient({
        endPoint: this.url.hostname,
        port: this.url.port ? parseInt(this.url.port) : undefined,
        accessKey: this.accessKey,
        secretKey: this.secretKey,
        useSSL: this.url.protocol === 'https',
        region: this.region
      });
    }
    return this.client;
  }

  public hasObjectOffline(bucket: string, key: string): boolean | undefined {
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

  public removePresentObject(bucket: string, key?: string): void {
    if (key === undefined) {
      for (const objectKey of this.presentObjects.keys()) {
        if (objectKey.startsWith(bucket)) {
          this.presentObjects.delete(objectKey);
        }
      }

      return;
    }
    if (this.presentObjects.has(`${bucket}/${key}`)) {
      this.presentObjects.delete(`${bucket}/${key}`);
    }
  }

  public addAbsentObject(bucket: string, key: string): void {
    this.absentObjects.add(`${bucket}/${key}`);
    this.removePresentObject(bucket, key);
  }

  public removeAbsentObject(bucket: string, key?: string): void {
    if (key === undefined) {
      for (const objectKey of this.absentObjects.keys()) {
        if (objectKey.startsWith(bucket)) {
          this.absentObjects.delete(objectKey);
        }
      }

      return;
    }
  
    if (this.absentObjects.has(`${bucket}/${key}`)) {
      this.absentObjects.delete(`${bucket}/${key}`);
    }
  }

  public async hasObject(bucket: string, key: string): Promise<boolean> {
    const offline = this.hasObjectOffline(bucket, key);
    if (offline !== undefined) {
      return offline;
    }
    const client = this.getClient();
    try {
      await client.statObject(bucket, key);
      this.addPresentObject(bucket, key);
      return true;
    } catch (e) {
      this.addAbsentObject(bucket, key);
      return false;
    }
  }

  public reset() {
    this.absentObjects.clear();
    this.presentObjects.clear();
  }

  public getURL() {
    return this.url;
  }

  public toJson() {
    return {
      url: this.url.toString(),
      presentObjects: [...this.presentObjects.values()],
      absentObjects: [...this.absentObjects.values()],
    };
  }
}
