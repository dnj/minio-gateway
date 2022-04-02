import Action from './Action';

export default class PutBucketIntelligentTieringConfiguration extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    'intelligent-tiering': {
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
  };
}
