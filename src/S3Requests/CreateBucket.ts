import Action from './Action';

export default class CreateBucket extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
