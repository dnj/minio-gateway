import * as fs from 'fs/promises';
import Ajv, { JSONSchemaType } from 'ajv';
import { container, singleton } from 'tsyringe';
import Upstream from './Upstream';

export interface IConfigMinio {
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

export interface ICacheConfig {
  resetInterval: number;
}

export interface ICloneConfig {
  maxRunning: number;
}

interface IConfigData {
  'main-endpoint': string;
  'minio': IConfigMinio;
  'master': IConfigMinio;
  'slaves': IConfigMinio[];
  'http-server': IHttpServerConfig;
  'admin-access': IAdminAccess;
  'logging': ILoggingConfig;
  'cache': ICacheConfig;
  'clone': ICloneConfig;
}

const upstreamSchema: JSONSchemaType<IConfigMinio> = {
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

const cacheSchema: JSONSchemaType<ICacheConfig> = {
  type: 'object',
  properties: {
    resetInterval: {
      type: 'integer',
      default: 3600,
    },
  },
  required: [],
  additionalProperties: false,
};

const cloneSchema: JSONSchemaType<ICloneConfig> = {
  type: 'object',
  properties: {
    maxRunning: {
      type: 'integer',
      default: 8,
    },
  },
  required: [],
  additionalProperties: false,
};

const schema: JSONSchemaType<IConfigData> = {
  type: 'object',
  properties: {
    'main-endpoint': { type: 'string' },
    'minio': upstreamSchema,
    'master': upstreamSchema,
    'http-server': httpServerSchema,
    slaves: {
      type: 'array',
      items: upstreamSchema,
    },
    'admin-access': adminAccessSchema,
    logging: loggingSchema,
    cache: cacheSchema,
    clone: cloneSchema,
  },
  required: ['main-endpoint', 'minio'],
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

  public constructor(protected data: IConfigData) {
  }

  public get(name: keyof IConfigData): any {
    return this.data[name];
  }

  public getMainEndpoint(): string {
    return this.data['main-endpoint'];
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

  public isMaster(): boolean {
    return this.data.master === undefined;
  }

  public isSlave(): boolean {
    return this.data.master !== undefined;
  }
  public getMinio(): IConfigMinio {
    return this.data.minio;
  }

  public getMaster(): IConfigMinio|undefined {
    return this.data.master;
  }

  public getSlaves(): IConfigMinio[] {
    return this.data.slaves || [];
  }

  public getCache(): ICacheConfig {
    return this.data.cache;
  }

  public getClone(): ICloneConfig {
    return this.data.clone;
  }

}
