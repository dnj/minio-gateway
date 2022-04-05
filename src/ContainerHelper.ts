import { container } from "tsyringe";
import Upstream from "./Upstream";

export default class ContainerHelper {

	/**
	 * @returns Upstream[] It's guranteed to result will be in this sort: minio (if `includeMinio`) then master then slaves
	 */
	public static getUpstreams(includeMinio: boolean = false): Upstream[] {
		const result = [];
		if (includeMinio) {
			result.push(this.getMinio());
		}
		const master = this.getMaster();
		if (master !== undefined) {
			result.push(master);
		}
		result.push(...this.getSalves());
		return result;
	}

	public static getSalves(): Upstream[] {
		if (!container.isRegistered("slave")) {
			return [];
		}
		return container.resolveAll<Upstream>("slave");
	}

	public static getMaster(): Upstream|undefined {
		if (!container.isRegistered("master")) {
			return undefined;
		}
		return container.resolve<Upstream>("master");
	}

	public static getMinio(): Upstream {
		return container.resolve<Upstream>("minio");
	}
}