import Action from './Action';

export default class ListBucketInventoryConfigurations extends Action {
  public readonly method: string = 'GET';

  public readonly parameters = {
    inventory: {
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
