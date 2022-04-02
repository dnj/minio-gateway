import Action from './Action';

export default class ListObjects extends Action {
  public readonly method: string = 'GET';

  public readonly parameters = {
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
