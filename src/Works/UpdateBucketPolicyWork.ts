import Upstream from '../Upstream';
import Work from '../Work';

export default class UpdateBucketPolicyWork extends Work {
  public constructor(protected source: Upstream, protected bucket: string) {
    super();
  }

  public async do(dist: Upstream): Promise<void> {
    const policy = await this.source.getClient().getBucketPolicy(this.bucket);
    return dist.getClient().setBucketPolicy(this.bucket, policy);
  }
}
