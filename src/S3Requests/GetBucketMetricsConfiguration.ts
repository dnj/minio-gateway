import Action from './Action';

export default class GetBucketMetricsConfiguration extends Action {
  public readonly method: string = 'GET';

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
    'x-amz-expected-bucket-owner': {
      required: false,
      place: 'header',
    },
  };
}
