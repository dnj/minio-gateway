import * as fs from 'fs/promises';
import Ajv, { JSONSchemaType } from 'ajv';
import { singleton } from 'tsyringe';
import CacheManager from './CacheManager';
import Upstream from './Upstream';

interface IConfigUpstream {
  url: string;
  accessKey: string;
  secretKey: string;
}
interface IHttpServerConfig {
  port: number;
  address?: string;
}

interface IAdminAccess {
  username: string;
  password: string;
}

export interface ILoggingConfig {
  level: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
  file: string;
  console: boolean;
}

interface IConfigData {
  'main-endpoint': string;
  'primary-upstream': IConfigUpstream;
  'peers'?: IConfigUpstream[];
  'http-server': IHttpServerConfig;
  'admin-access': IAdminAccess;
  'logging': ILoggingConfig;
}

const upstreamSchema: JSONSchemaType<IConfigUpstream> = {
  type: 'object',
  properties: {
    url: { type: 'string' },
    accessKey: { type: 'string' },
    secretKey: { type: 'string' },
  },
  required: ['url', 'accessKey', 'secretKey'],
  additionalProperties: false,
};

const httpServerSchema: JSONSchemaType<IHttpServerConfig> = {
  type: 'object',
  properties: {
    port: { type: 'integer' },
    address: { type: 'string', nullable: true },
  },
  required: ['port'],
  additionalProperties: false,
};

const adminAccessSchema: JSONSchemaType<IAdminAccess> = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['username', 'password'],
  additionalProperties: false,
};

const loggingSchema: JSONSchemaType<ILoggingConfig> = {
  type: 'object',
  properties: {
    level: {
      type: 'string',
      enum: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
      default: 'info',
    },
    file: { type: 'string', default: '/var/log/minio-gateway.log' },
    console: { type: 'boolean', default: false },
  },
  required: ['level'],
  additionalProperties: false,
};

const schema: JSONSchemaType<IConfigData> = {
  type: 'object',
  properties: {
    'main-endpoint': { type: 'string' },
    'primary-upstream': upstreamSchema,
    'http-server': httpServerSchema,
    peers: {
      type: 'array',
      items: upstreamSchema,
      nullable: true,
    },
    'admin-access': adminAccessSchema,
    logging: loggingSchema,
  },
  required: ['main-endpoint', 'primary-upstream'],
  additionalProperties: true,
};

@singleton()
export default class ConfigRepository {
  public static async fromFile(path: string): Promise<ConfigRepository> {
    const content = (await fs.readFile(path)).toString();
    const data = JSON.parse(content);

    const ajv = new Ajv();
    const validate = ajv.compile(schema);

    if (!validate(data)) {
      console.error(validate.errors);
      throw new Error('config validation failed');
    }
    return new ConfigRepository(data);
  }

  protected upstreams?: Upstream[] = undefined;

  protected primaryUpstream?: Upstream = undefined;

  protected cacheManager: CacheManager;

  public constructor(protected data: IConfigData) {
    this.cacheManager = new CacheManager(this);
  }

  public get(name: keyof IConfigData): any {
    return this.data[name];
  }

  public getMainEndpoint(): string {
    return this.data['main-endpoint'];
  }

  public getUpstreams(includePrimary: boolean = false): Upstream[] {
    if (this.upstreams === undefined) {
      if (this.data.peers === undefined) {
        this.data.peers = [];
      }
      this.upstreams = this.data.peers.map((config) => new Upstream(new URL(config.url), config.accessKey, config.secretKey, this.cacheManager));
    }
    return this.upstreams.concat(includePrimary ? [this.getPrimaryUpstream()] : []);
  }

  public getPrimaryUpstream(): Upstream {
    if (this.primaryUpstream === undefined) {
      const config = this.data['primary-upstream'];
      this.primaryUpstream = new Upstream(new URL(config.url), config.accessKey, config.secretKey, this.cacheManager);
    }
    return this.primaryUpstream;
  }

  public getHttpServerConfig() {
    return this.data['http-server'];
  }

  public getAdminAccess() {
    return this.data['admin-access'];
  }

  public getLogging(): ILoggingConfig {
    return this.data.logging;
  }
}
