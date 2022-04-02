import Action from './Action';

export default class ListObjectVersions extends Action {
  public readonly method: string = 'GET';

  public readonly parameters = {
    versions: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
