import Work from '../Work';
import Upstream from '../Upstream';

export default class CreateBucketWork extends Work {
  public constructor(
    protected bucket: string,
    protected region: string,
  ) {
    super();
  }

  public async do(upstream: Upstream): Promise<void> {
    return upstream.getClient().makeBucket(this.bucket, this.region);
  }
}
