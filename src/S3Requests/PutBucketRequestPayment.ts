import Action from './Action';

export default class PutBucketRequestPayment extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    requestPayment: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
