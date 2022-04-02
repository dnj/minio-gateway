import Action from './Action';

export default class GetObject extends Action {
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
    'If-Match': {
      required: false,
      place: 'header',
    },
    'If-Modified-Since': {
      required: false,
      place: 'header',
    },
    'If-None-Match': {
      required: false,
      place: 'header',
    },
    'If-Unmodified-Since': {
      required: false,
      place: 'header',
    },
    partNumber: {
      required: false,
      place: 'url',
    },
    Range: {
      required: false,
      place: 'header',
    },
    'response-cache-control': {
      required: false,
      place: 'url',
    },
    'response-content-disposition': {
      required: false,
      place: 'url',
    },
    'response-content-encoding': {
      required: false,
      place: 'url',
    },
    'response-content-language': {
      required: false,
      place: 'url',
    },
    'response-content-type': {
      required: false,
      place: 'url',
    },
    'response-expires': {
      required: false,
      place: 'url',
    },
    versionId: {
      required: false,
      place: 'url',
    },
    'x-amz-checksum-mode': {
      required: false,
      place: 'header',
    },
    'x-amz-expected-bucket-owner': {
      required: false,
      place: 'header',
    },
    'x-amz-request-payer': {
      required: false,
      place: 'header',
    },
    'x-amz-server-side-encryption-customer-algorithm': {
      required: false,
      place: 'header',
    },
    'x-amz-server-side-encryption-customer-key': {
      required: false,
      place: 'header',
    },
    'x-amz-server-side-encryption-customer-key-MD5': {
      required: false,
      place: 'header',
    },
  };
}
