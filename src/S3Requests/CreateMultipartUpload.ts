import Action from './Action';

export default class CreateMultipartUpload extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    bucket: {
      required: true,
      place: 'url',
    },
    key: {
      required: true,
      place: 'url',
    },
    uploads: {
      required: true,
      place: 'url',
    },
  };
}
