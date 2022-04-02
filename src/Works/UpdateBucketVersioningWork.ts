import Upstream from '../Upstream';
import Work from '../Work';

export default class UpdateBucketVersioningWork extends Work {
  public constructor(protected source: Upstream, protected bucket: string) {
    super();
  }

  public async do(dist: Upstream): Promise<void> {
    const versioning = await this.source.getClient().getBucketVersioning(this.bucket);
    return dist.getClient().setBucketVersioning(this.bucket, versioning);
  }
}
