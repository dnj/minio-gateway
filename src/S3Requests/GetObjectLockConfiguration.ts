import Action from './Action';

export default class GetObjectLockConfiguration extends Action {
  public readonly method: string = 'GET';

  public readonly parameters = {
    'object-lock': {
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
