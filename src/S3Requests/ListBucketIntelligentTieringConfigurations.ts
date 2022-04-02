import Action from './Action';

export default class ListBucketIntelligentTieringConfigurations extends Action {
  public readonly method: string = 'GET';

  public readonly parameters = {
    'intelligent-tiering': {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
    'continuation-token': {
      required: false,
      place: 'header',
    },
  };
}
