import { BucketItem } from 'minio';
import { CompareResult, DiffList } from './DiffList';

export default class BucketItemDiffList extends DiffList<BucketItem> {
  public constructor() {
    super((src, dist) => {
      if (src.name > dist.name) {
        return CompareResult.GREATER;
      } if (src.name < dist.name) {
        return CompareResult.LESSER;
      }

      if (src.etag !== dist.etag) {
        return CompareResult.SAME_BUT_CHANGED;
      }
      return CompareResult.SAME;
    });
  }
}
