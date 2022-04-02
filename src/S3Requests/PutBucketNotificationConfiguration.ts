import Action from './Action';

export default class PutBucketNotificationConfiguration extends Action {
  public readonly method: string = 'PUT';

  public readonly parameters = {
    notification: {
      required: true,
      place: 'url',
    },
    bucket: {
      required: true,
      place: 'url',
    },
  };
}
