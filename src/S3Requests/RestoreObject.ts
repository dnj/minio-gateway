import Action from './Action';

export default class RestoreObject extends Action {
  public readonly method: string = 'POST';

  public readonly parameters = {
    restore: {
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
