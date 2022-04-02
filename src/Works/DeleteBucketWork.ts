import Upstream from '../Upstream';
import Work from '../Work';

export default class DeleteBucketWork extends Work {
  public constructor(protected bucket: string) {
    super();
  }

  public async do(upstream: Upstream): Promise<void> {
    return upstream.getClient().removeBucket(this.bucket);
  }
}
