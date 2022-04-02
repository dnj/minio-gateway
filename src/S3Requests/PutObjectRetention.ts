import Action from './Action';

export default class PutObjectRetention extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    retention: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
    key: {
      required: true,
      place: 'url',
    },
  };
}
