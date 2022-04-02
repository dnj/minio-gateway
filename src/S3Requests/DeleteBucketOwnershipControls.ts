import Action from './Action';

export default class DeleteBucketOwnershipControls extends Action {
  public readonly method: string = 'DELETE';

  public readonly parameters = {
    ownershipControls: {
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
