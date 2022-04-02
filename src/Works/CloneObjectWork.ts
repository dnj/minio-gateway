import Work from '../Work';
import Upstream from '../Upstream';

export default class CloneObjectWork extends Work {
  public constructor(protected source: Upstream, protected bucket: string, protected key: string) {
    super();
  }

  public async do(dist: Upstream) {
    const object = await this.source.getClient().statObject(this.bucket, this.key);
    const readable = await this.source.getClient().getObject(this.bucket, this.key);
    return dist.getClient().putObject(this.bucket, this.key, readable, object.size, object.metaData);
  }
}
