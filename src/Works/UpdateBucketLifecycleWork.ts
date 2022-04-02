import Upstream from '../Upstream';
import Work from '../Work';

export default class UpdateBucketLifecycleWork extends Work {
  public constructor(protected source: Upstream, protected bucket: string) {
    super();
  }

  public async do(dist: Upstream): Promise<void> {
    const lifecycle = await this.source.getClient().getBucketLifecycle(this.bucket);
    return dist.getClient().setBucketLifecycle(this.bucket, lifecycle);
  }
}
