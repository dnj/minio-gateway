import Upstream from './Upstream';

export default abstract class Work<T = any> {
  public constructor() {}

  public abstract do(upstream: Upstream): Promise<T>;
}
