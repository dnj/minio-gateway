import Action from './Action';

export default class PutBucketPolicy extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    policy: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
