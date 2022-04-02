import { IncomingMessage } from 'http';
import ConfigRepository from './ConfigRepository';
import {
  CompleteMultipartUpload, CopyObject, CreateBucket, DeleteBucket, DeleteObject, DeleteObjects, GetObject, PutBucketLifecycleConfiguration, PutBucketNotificationConfiguration, PutBucketPolicy, PutBucketTagging, PutBucketVersioning, PutObject, PutObjectLockConfiguration,
} from './S3Requests';
import Action from './S3Requests/Action';
import Upstream from './Upstream';
import CloneObjectWork from './Works/CloneObjectWork';
import CreateBucketWork from './Works/CreateBucketWork';
import DeleteBucketWork from './Works/DeleteBucketWork';
import DeleteObjectWork from './Works/DeleteObjectWork';
import UpdateBucketVersioningWork from './Works/UpdateBucketVersioningWork';
import UpdateBucketPolicyWork from './Works/UpdateBucketPolicyWork';
import UpdateBucketTaggingWork from './Works/UpdateBucketTaggingWork';
import UpdateBucketLifecycleWork from './Works/UpdateBucketLifecycleWork';
import UpdateObjectLockConfigurationWork from './Works/UpdateObjectLockConfigurationWork';
import UpdateBucketNotificationWork from './Works/UpdateBucketNotificationWork';
import Work from './Work';

export default class CacheManager {
  public constructor(
    protected config: ConfigRepository,
  ) {

  }

  public handleResponse(
    upstream: Upstream,
    action: Action,
    response: IncomingMessage,
  ) {
    if (action instanceof CreateBucket) {
      return this.handleCreateBucket(upstream, action, response);
    }
    if (action instanceof PutBucketPolicy) {
      return this.handlePutBucketPolicy(upstream, action, response);
    }
    if (action instanceof PutBucketTagging) {
      return this.handlePutBucketTagging(upstream, action, response);
    }
    if (action instanceof PutBucketVersioning) {
      return this.handlePutBucketVersioning(upstream, action, response);
    }
    if (action instanceof PutBucketLifecycleConfiguration) {
      return this.handlePutBucketLifecycle(upstream, action, response);
    }
    if (action instanceof PutObjectLockConfiguration) {
      return this.handlePutObjectLockConfiguration(upstream, action, response);
    }
    if (action instanceof PutBucketNotificationConfiguration) {
      return this.handlePutBucketNotification(upstream, action, response);
    }
    if (action instanceof DeleteBucket) {
      return this.handleDeleteBucket(upstream, action, response);
    }
    if (action instanceof GetObject) {
      return this.handleGetObject(upstream, action, response);
    }
    if (
      action instanceof PutObject
			|| action instanceof CompleteMultipartUpload
			|| action instanceof CopyObject
    ) {
      return this.handlePutObject(upstream, action, response);
    }
    if (action instanceof DeleteObject) {
      return this.handleDeleteObject(upstream, action, response);
    }
    if (action instanceof DeleteObjects) {
      return this.handleDeleteObjects(upstream, action, response);
    }
  }

  protected handleCreateBucket(upstream: Upstream, action: CreateBucket, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new CreateBucketWork(action.bucket, ''));
  }

  protected handleDeleteBucket(upstream: Upstream, action: DeleteBucket, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new DeleteBucketWork(action.bucket));
  }

  protected handlePutBucketPolicy(upstream: Upstream, action: PutBucketPolicy, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new UpdateBucketPolicyWork(upstream, action.bucket));
  }

  protected handlePutBucketTagging(upstream: Upstream, action: PutBucketTagging, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new UpdateBucketTaggingWork(upstream, action.bucket));
  }

  protected handlePutBucketVersioning(upstream: Upstream, action: PutBucketVersioning, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new UpdateBucketVersioningWork(upstream, action.bucket));
  }

  protected handlePutBucketLifecycle(upstream: Upstream, action: PutBucketLifecycleConfiguration, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new UpdateBucketLifecycleWork(upstream, action.bucket));
  }

  protected handlePutObjectLockConfiguration(upstream: Upstream, action: PutObjectLockConfiguration, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new UpdateObjectLockConfigurationWork(upstream, action.bucket));
  }

  protected handlePutBucketNotification(upstream: Upstream, action: PutBucketNotificationConfiguration, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new UpdateBucketNotificationWork(upstream, action.bucket));
  }

  protected handleGetObject(upstream: Upstream, action: GetObject, response: IncomingMessage) {
    if (response.statusCode === undefined) {
      return;
    }
    if (response.statusCode >= 200 && response.statusCode < 300) {
      upstream.addPresentObject(action.bucket, action.key);
    } else if (response.statusCode === 404) {
      upstream.addAbsentObject(action.bucket, action.key);
    }
  }

  protected handlePutObject(
    upstream: Upstream,
    action: PutObject | CompleteMultipartUpload | CopyObject,
    response: IncomingMessage,
  ) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new CloneObjectWork(upstream, action.bucket, action.key));
  }

  protected handleDeleteObject(upstream: Upstream, action: DeleteObject, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {
      return;
    }
    return this.addWorkForPeers(upstream, () => new DeleteObjectWork(action.bucket, action.key));
  }

  protected handleDeleteObjects(upstream: Upstream, action: DeleteObjects, response: IncomingMessage) {
    if (!this.isSuccessfull(response)) {

    }
    // TODO
    // return this.addWorkForPeers(upstream, () => new DeleteObjectWork(action.bucket, action.key));
  }

  protected isSuccessfull(response: IncomingMessage): boolean {
    return (response.statusCode !== undefined && response.statusCode >= 200 && response.statusCode < 300);
  }

  protected findPeers(source: Upstream): Upstream[] {
    return this.config.getUpstreams(true).filter((item) => item !== source);
  }

  protected addWorkForPeers<T>(source: Upstream, callback: (peer: Upstream) => Work<T>) {
    return Promise.allSettled(this.findPeers(source)
      .map((peer) => {
        const work = callback(peer);
        return peer.workQueue.enqueue(work);
      }));
  }
}
