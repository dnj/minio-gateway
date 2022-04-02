import Upstream from '../Upstream';
import Work from '../Work';

export default class UpdateObjectLockConfigurationWork extends Work {
  public constructor(protected source: Upstream, protected bucket: string) {
    super();
  }

  public async do(dist: Upstream): Promise<void> {
    const lock = await this.source.getClient().getObjectLockConfig(this.bucket);
    return dist.getClient().setObjectLockConfig(this.bucket, lock);
  }
}
