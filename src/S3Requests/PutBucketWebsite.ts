import Action from './Action';

export default class PutBucketWebsite extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    website: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
