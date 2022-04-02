import Upstream from '../Upstream';
import Work from '../Work';

export default class UpdateBucketNotificationWork extends Work {
  public constructor(protected source: Upstream, protected bucket: string) {
    super();
  }

  public async do(dist: Upstream): Promise<void> {
    const config = await this.source.getClient().getBucketNotification(this.bucket);
    return dist.getClient().setBucketNotification(this.bucket, config);
  }
}
