import Upstream from "./Upstream";
import * as fs from "fs/promises";
import Ajv, { JSONSchemaType } from "ajv"

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
interface IConfigData {
	"main-endpoint": string;
	"primary-upstream": IConfigUpstream;
	"peer-upstreams"?: IConfigUpstream[];
	"http-server": IHttpServerConfig;
	"admin-access": IAdminAccess;
}

const upstreamSchema: JSONSchemaType<IConfigUpstream> = {
	type: "object",
	properties: {
		"url": { type: "string" },
		"accessKey": { type: "string" },
		"secretKey": { type: "string" },
	},
	required: ["url", "accessKey", "secretKey"],
	additionalProperties: false
}

const httpServerSchema: JSONSchemaType<IHttpServerConfig> = {
	type: "object",
	properties: {
		"port": { type: "integer" },
		"address": { type: "string", nullable: true },
	},
	required: ["port"],
	additionalProperties: false
}

const adminAccessSchema: JSONSchemaType<IAdminAccess> = {
	type: "object",
	properties: {
		"username": { type: "string" },
		"password": { type: "string" },
	},
	required: ["username", "password"],
	additionalProperties: false,
}

const schema: JSONSchemaType<IConfigData> = {
	type: "object",
	properties: {
		"main-endpoint": { type: "string" },
		"primary-upstream": upstreamSchema,
		"http-server": httpServerSchema,
		"peer-upstreams": {
			type: "array",
			items: upstreamSchema,
			nullable: true
		},
		"admin-access": adminAccessSchema
	},
	required: ["main-endpoint", "primary-upstream"],
	additionalProperties: true
}
export default class ConfigRepository {
	public static async fromFile(path: string): Promise<ConfigRepository> {
		const content = (await fs.readFile(path)).toString();
		const data = JSON.parse(content);

		const ajv = new Ajv();
		const validate = ajv.compile(schema);

		if (!validate(data)) {
			console.error(validate.errors);
			throw new Error("config validation failed");
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
		return this.data["main-endpoint"];
	}

	public getUpstreams(includePrimary: boolean = false): Upstream[] {
		if (this.upstreams === undefined) {
			if (this.data["peer-upstreams"] === undefined) {
				this.data["peer-upstreams"] = [];
			}
			this.upstreams = this.data["peer-upstreams"].map((config) => {
				return new Upstream(new URL(config.url), config.accessKey, config.secretKey);
			});
		}
		return this.upstreams.concat(includePrimary ? [this.getPrimaryUpstream()] : []);
	}

	public getPrimaryUpstream(): Upstream {
		if (this.primaryUpstream === undefined) {
			const config = this.data["primary-upstream"];
			this.primaryUpstream = new Upstream(new URL(config.url), config.accessKey, config.secretKey);
		}
		return this.primaryUpstream;
	}

	public getHttpServerConfig() {
		return this.data["http-server"];
	}

	public getAdminAccess() {
		return this.data["admin-access"];
	}
}