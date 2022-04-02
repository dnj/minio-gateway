import Action from './Action';

export default class ListParts extends Action {
  public readonly method: string = 'GET';

  public readonly parameters = {
    bucket: {
      required: true,
      place: 'url',
    },
    key: {
      required: true,
      place: 'url',
    },
    uploadId: {
      required: true,
      place: 'url',
    },
  };
}
