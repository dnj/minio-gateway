import Action from './Action';

export default class PutBucketMetricsConfiguration extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    metrics: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
    id: {
      required: true,
      place: 'url',
    },
  };
}
