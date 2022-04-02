import Action from './Action';

export default class PutBucketAccelerateConfiguration extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    accelerate: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
