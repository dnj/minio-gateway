import Action from './Action';

export default class DeleteBucketReplication extends Action {
  public readonly method: string = 'DELETE';

  public readonly parameters = {
    replication: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
    'x-amz-expected-bucket-owner': {
      required: false,
      place: 'header',
    },
  };
}
