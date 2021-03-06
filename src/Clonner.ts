import { container, inject, injectable } from 'tsyringe';
import winston from 'winston';
import { SingleBar } from 'cli-progress';
import { BucketItem } from 'minio';
import Upstream from './Upstream';
import BucketItemDiffList from './Clonner/BucketItemDiffList';
import { WorkQueue } from './WorkQueue';
import CloneObjectWork from './Works/CloneObjectWork';
import DeleteObjectWork from './Works/DeleteObjectWork';
import ConfigRepository from './ConfigRepository';
import ContainerHelper from './ContainerHelper';

@injectable()
export default class Clonner {
  public static async start(config: ConfigRepository, bucketNames?: string[], progressbar?: SingleBar) {
    const clonner = container.resolve(Clonner);
    clonner.setSource(config.isMaster() ? ContainerHelper.getMinio() : ContainerHelper.getMaster());
    clonner.setProgressBar(progressbar);

    const runClone = async (dist: Upstream) => {
      try {
        return await clonner.cloneBuckets(dist, bucketNames);
      } catch (e) {
        console.error(`error during cloning buckets to ${dist.getURL().toString()}`, e);
      }
    }

    if (config.isSlave()) {
      const me = ContainerHelper.getMinio();
      await runClone(me);
    } else {
      for (const peer of ContainerHelper.getSalves()) {
        await runClone(peer);
      }
    }
  }

  public static async startSingle(
    config: ConfigRepository,
    bucket: string,
    progressbar?: SingleBar,
    prefix?: string,
    after?: string
  ) {
    const clonner = container.resolve(Clonner);
    clonner.setSource(config.isMaster() ? ContainerHelper.getMinio() : ContainerHelper.getMaster());
    clonner.setProgressBar(progressbar);

    const runClone = async (dist: Upstream) => {
      try {
        return await clonner.cloneBucket(dist, bucket, prefix, after);
      } catch (e) {
        console.error(`error during cloning bucket ${bucket} to ${dist.getURL().toString()}`, e);
      }
    }

    if (config.isSlave()) {
      const me = ContainerHelper.getMinio();
      await runClone(me);
    } else {
      for (const peer of ContainerHelper.getSalves()) {
        await runClone(peer);
      }
    }
  }

  private source: Upstream | undefined;

  private progressBar: SingleBar | undefined;

  public constructor(
    @inject(ConfigRepository) private config: ConfigRepository,
    @inject('Logger') private logger: winston.Logger,
  ) {
  }

  public setSource(source?: Upstream): this {
    this.source = source;

    return this;
  }

  public getSource(): Upstream {
    if (this.source === undefined) {
      throw new Error('source is not defined yet');
    }
    return this.source;
  }

  public setProgressBar(progressBar?: SingleBar) {
    this.progressBar = progressBar;

    return this;
  }

  public getProgressBar() {
    return this.progressBar;
  }

  public async cloneBuckets(dist: Upstream, bucketNames?: string[]): Promise<void> {
    this.logger.info('cloning buckets', { dist: dist.getURL().toString(), bucketNames });
    let buckets = await this.getSource().getClient().listBuckets();
    if (bucketNames !== undefined) {
      buckets = buckets.filter((bucket) => bucketNames.includes(bucket.name));
    }
    for (const bucket of buckets) {
      await this.cloneBucket(dist, bucket.name);
    }
  }

  public async cloneBucket(dist: Upstream, bucket: string, prefix?: string, after?: string): Promise<void> {
    this.logger.info('cloning bucket', { dist: dist.getURL().toString(), bucket });

    const srcAPI = this.getSource().getClient();
    const distAPI = dist.getClient();

    this.logger.verbose('check bucket is exists on dist', { dist: dist.getURL().toString(), bucket });
    if (!await distAPI.bucketExists(bucket)) {
      this.logger.info('creating bucket', { dist: dist.getURL().toString(), bucket });
      await distAPI.makeBucket(bucket, '');
    }

    const encryptionSync = async () => {
      this.logger.verbose('sync encryption config on bucket', { dist: dist.getURL().toString(), bucket });
      const config = await srcAPI.getBucketEncryption(bucket);
      return distAPI.setBucketEncryption(bucket, config);
    };
    const lifecycleSync = async () => {
      this.logger.verbose('sync lifecycle config on bucket', { dist: dist.getURL().toString(), bucket });
      const config = await srcAPI.getBucketLifecycle(bucket);
      return distAPI.setBucketLifecycle(bucket, config);
    };
    const notificationSync = async () => {
      this.logger.verbose('sync notification config on bucket', { dist: dist.getURL().toString(), bucket });
      const config = await srcAPI.getBucketNotification(bucket);
      return distAPI.setBucketNotification(bucket, config);
    };
    const policySync = async () => {
      this.logger.verbose('sync policy config on bucket', { dist: dist.getURL().toString(), bucket });
      const config = await srcAPI.getBucketPolicy(bucket);
      return distAPI.setBucketPolicy(bucket, config);
    };
    const replicationSync = async () => {
      this.logger.verbose('sync replication config on bucket', { dist: dist.getURL().toString(), bucket });
      const config = await srcAPI.getBucketReplication(bucket);
      return distAPI.setBucketReplication(bucket, config);
    };
    const taggingSync = async () => {
      this.logger.verbose('sync tagging config on bucket', { dist: dist.getURL().toString(), bucket });
      const tags = await srcAPI.getBucketTagging(bucket);
      const tagList: Record<string, string> = {};
      for (const tag of tags) {
        tagList[tag.Key] = tag.Value;
      }
      return distAPI.setBucketTagging(bucket, tagList);
    };
    const versionningSync = async () => {
      this.logger.verbose('sync versioning config on bucket', { dist: dist.getURL().toString(), bucket });
      const config = await srcAPI.getBucketVersioning(bucket);
      return distAPI.setBucketVersioning(bucket, config);
    };

    await Promise.allSettled([
      encryptionSync(),
      lifecycleSync(),
      notificationSync(),
      policySync(),
      replicationSync(),
      taggingSync(),
      versionningSync(),
    ]);
    await this.cloneObjects(dist, bucket, prefix, after);
  }

  public cloneObjects(dist: Upstream, bucket: string, prefix?: string, after?: string): Promise<void> {
    return new Promise((resolve) => {
      this.logger.info('cloning objects in bucket', { dist: dist.getURL().toString(), bucket });

      const source = this.getSource();
      const diffList = new BucketItemDiffList();
      const queue = new WorkQueue(dist);
      const maxRunning = this.config.getClone().maxRunning || 8;
      queue.setMaxRunning(maxRunning);


      const onSourceStreamEnd = () => {
        diffList.addSource(null);
        if (diffList.isEnded() && queue.isIddle()) {
          this.progressBar?.stop();
          resolve();
        }
      };
      const sourceStream = source.getClient().listObjectsV2(bucket, prefix, true, after);
      sourceStream.on('data', (object) => {
        diffList.addSource(object);
      });
      sourceStream.on('end', onSourceStreamEnd);
      sourceStream.on("error", (err) => {
        this.logger.error("Error in source upstream occured", {
          err: err,
        });
        onSourceStreamEnd();
      });


      const onDistStreamEnd = () => {
        diffList.addDist(null);
        if (diffList.isEnded() && queue.isIddle()) {
          this.progressBar?.stop();
          resolve();
        }
      };
      const distStream = dist.getClient().listObjectsV2(bucket, prefix, true, after);
      distStream.on('data', (object) => {
        diffList.addDist(object);
      });
      distStream.on('end', onDistStreamEnd);
      distStream.on("error", (err) => {
        this.logger.error("Error in dist upstream occured", {
          err: err,
        });
        onDistStreamEnd();
      });

      queue.on("added", () => {
        if (queue.length() >= queue.getMaxRunning()) {
          if (!sourceStream.isPaused()) {
            sourceStream.pause();
          }
          if (!distStream.isPaused()) {
            distStream.pause();
          }
        }
      });
      queue.on("finished", () => {
        if (queue.length() < queue.getMaxRunning()) {
          if (sourceStream.isPaused()) {
            sourceStream.resume();
          }
          if (distStream.isPaused()) {
            distStream.resume();
          }
        }
      });

      const doneHandler = (size: number) => {
        if (this.progressBar !== undefined) {
          this.progressBar.increment(size, { workers: queue.getRunning() });
        }
      };
      const errorHandler = (message: string, object: BucketItem, reason: any) => {
        this.logger.error(message, {
          source: source.getURL().toString(),
          dist: dist.getURL().toString(),
          bucket,
          object: object.name,
          reason,
        });
      };

      diffList.on('created', (object) => {
        this.logger.debug('object is created', {
          dist: dist.getURL().toString(),
          bucket,
          object,
        });
        if (this.progressBar !== undefined) {
          this.progressBar.setTotal(this.progressBar.getTotal() + object.size);
        }

        queue.enqueue(new CloneObjectWork(source, bucket, object.name)).then(
          () => doneHandler(object.size),
          (reason) => errorHandler('object creation failed', object, reason),
        );
      });
      diffList.on('changed', (current, old) => {
        this.logger.debug('object is changed', {
          dist: dist.getURL().toString(),
          bucket,
          current,
          old,
        });
        if (this.progressBar !== undefined) {
          this.progressBar.setTotal(this.progressBar.getTotal() + current.size);
        }
        queue.enqueue(new CloneObjectWork(source, bucket, current.name)).then(
          () => doneHandler(current.size),
          (reason) => errorHandler('object update failed', current, reason),
        );
      });
      diffList.on('deleted', (object) => {
        this.logger.debug('object is deleted', {
          source: source.getURL().toString(),
          dist: dist.getURL().toString(),
          bucket,
          object: object.name,

        });

        const size = 1024; // static value of http request size
        if (this.progressBar !== undefined) {
          this.progressBar.setTotal(this.progressBar.getTotal() + size);
        }
        queue.enqueue(new DeleteObjectWork(bucket, object.name)).then(
          () => doneHandler(size),
          (reason) => errorHandler('object delete failed', object, reason),
        );
      });
      if (this.progressBar !== undefined) {
        this.progressBar.start(0, 0, { workers: 0 });
      }
    });
  }
}
