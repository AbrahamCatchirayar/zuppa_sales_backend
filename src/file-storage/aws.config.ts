import { S3 } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { env } from '../config';

@Injectable()
export class AwsS3Config {
  public s3: S3;

  constructor() {
    this.s3 = new S3({
      forcePathStyle: true,
      endpoint: env.spaces_endpoint,
      region: env.spaces_region,
      credentials: {
        accessKeyId: env.spaces_key,
        secretAccessKey: env.spaces_secret,
      },
    });
  }

  public getS3() {
    return this.s3;
  }
}
