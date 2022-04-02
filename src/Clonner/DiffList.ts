import { EventEmitter } from 'stream';

export enum CompareResult {
  SAME,
  LESSER,
  GREATER,
  SAME_BUT_CHANGED,
}

export type Comparator<T> = (src: T, dist: T) => CompareResult;

export declare interface DiffList<T> {
  on(event: 'created', listener: (item: T) => void): this;
  on(event: 'deleted', listener: (item: T) => void): this;
  on(event: 'changed', listener: (src: T, dist: T) => void): this;
}
export class DiffList<T> extends EventEmitter {
  private srcList: T[] = [];

  private dstList: T[] = [];

  private comparator: Comparator<T>;

  private srcEnded = false;

  private dstEnded = false;

  public constructor(comparator?: Comparator<T>) {
    super();
    if (comparator === undefined) {
      comparator = (a, b) => (a == b ? CompareResult.SAME : (a > b ? CompareResult.GREATER : CompareResult.LESSER));
    }
    this.comparator = comparator;
  }

  public addSource(item: T | null): this {
    if (item === null) {
      this.srcEnded = true;
    } else {
      this.srcList.push(item);
    }
    this.compare();
    return this;
  }

  public addDist(item: T | null): this {
    if (item === null) {
      this.dstEnded = true;
    } else {
      this.dstList.push(item);
    }
    this.compare();
    return this;
  }

  public end() {
    this.addSource(null);
    this.addDist(null);
  }

  public isEnded(): boolean {
    return this.srcEnded && this.dstEnded;
  }

  private compare() {
    while (true) {
      if (!this.srcList.length) {
        if (this.srcEnded) {
          this.emptyDistList();
        }
        break;
      }
      const src = this.srcList[0];

      if (!this.dstList.length) {
        if (this.dstEnded) {
          this.emptySrcList();
        }
        break;
      }
      const dist = this.dstList[0];

      const compare = this.comparator(src, dist);
      if (compare === CompareResult.SAME) {
        this.srcList.shift();
        this.dstList.shift();
        continue;
      }
      if (compare === CompareResult.SAME_BUT_CHANGED) {
        this.srcList.shift();
        this.dstList.shift();
        this.emit('changed', src, dist);
        continue;
      }
      if (compare === CompareResult.LESSER) {
        this.srcList.shift();
        this.emit('created', src);
        continue;
      }

      if (compare === CompareResult.GREATER) {
        this.dstList.shift();
        this.emit('deleted', dist);
        continue;
      }
    }
  }

  private emptySrcList(maxOffset?: number) {
    if (maxOffset === undefined) {
      maxOffset = this.srcList.length;
    }
    for (let x = 0; x < maxOffset; x++) {
      this.emit('created', this.srcList[x]);
    }
    this.srcList.splice(0, maxOffset);
  }

  private emptyDistList(maxOffset?: number) {
    if (maxOffset === undefined) {
      maxOffset = this.dstList.length;
    }
    for (let x = 0; x < maxOffset; x++) {
      this.emit('deleted', this.dstList[x]);
    }
    this.dstList.splice(0, maxOffset);
  }
}
