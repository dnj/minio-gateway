import Upstream from '../Upstream';
import Work from '../Work';

export default class UpdateBucketTaggingWork extends Work {
  public constructor(protected source: Upstream, protected bucket: string) {
    super();
  }

  public async do(dist: Upstream): Promise<void> {
    const tags = await this.source.getClient().getBucketTagging(this.bucket);
    const tagList: Record<string, string> = {};
    for (const tag of tags) {
      tagList[tag.Key] = tag.Value;
    }
    return dist.getClient().setBucketTagging(this.bucket, tagList);
  }
}
