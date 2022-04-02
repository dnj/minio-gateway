import Action from './Action';

export default class PutBucketTagging extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    tagging: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
