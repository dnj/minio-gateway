import Upstream from '../Upstream';
import Work from '../Work';

export default class DeleteObject extends Work {
  public constructor(protected bucket: string, protected key: string) {
    super();
  }

  public async do(upstream: Upstream): Promise<void> {
    return upstream.getClient().removeObject(this.bucket, this.key);
  }
}
