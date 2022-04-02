import Action from './Action';

export default class PutBucketVersioning extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    versioning: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
