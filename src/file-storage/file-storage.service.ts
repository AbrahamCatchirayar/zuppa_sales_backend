import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names
import { env } from '../config';
import { AwsS3Config } from './aws.config';

@Injectable()
export class FileService {
  constructor(private readonly awsS3Config: AwsS3Config) {}

  async uploadFile(account_id: string, file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer) {
      throw new BadRequestException(
        'Invalid file format. File must be uploaded as multipart/form-data',
      );
    }

    const fileKey = `${uuidv4()}-${file.originalname || file.filename}`;
    try {
      await this.awsS3Config.getS3().putObject({
        Bucket: account_id,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
        ACL: 'public-read',
      });
      return `${env.spaces_endpoint}${account_id}/${fileKey}`;
    } catch (error) {
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  async uploadAvatar(file: any, account_id: string) {
    try {
      const key = `logo/${uuidv4()}.jpg`;
      await this.awsS3Config.getS3().putObject({
        Bucket: account_id,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
      });

      return {
        url: `${env.spaces_endpoint}${account_id}/${key}`,
      };
    } catch (err) {
      throw new BadRequestException(
        `Error occur fetching url => ${err.message} `,
      );
    }
  }

  async userUploadAvatar(file: any, user_id: string) {
    try {
      const key = `avatar/${uuidv4()}.jpg`;
      await this.awsS3Config.getS3().putObject({
        Bucket: user_id,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
      });

      return {
        url: `${env.spaces_endpoint}${user_id}/${key}`,
      };
    } catch (err) {
      throw new BadRequestException(
        `Error occur fetching url => ${err.message} `,
      );
    }
  }

  async adminUploadAvatar(user_id: string, file: any) {
    try {
      const key = `avatar/${uuidv4()}.jpg`;
      const aws = await this.awsS3Config.getS3().putObject({
        Bucket: user_id,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
      });

      return {
        url: `${env.spaces_endpoint}${user_id}/${key}`,
      };
    } catch (err) {
      throw new BadRequestException(
        `Error occur fetching url => ${err.message} `,
      );
    }
  }

  async standardUploadLogo(file: any) {
    try {
      const key = `logo/${uuidv4()}.jpg`;
      const aws = await this.awsS3Config.getS3().putObject({
        Bucket: `standards`,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
      });
      return {
        url: `${env.spaces_endpoint}${`standards`}/${key}`,
      };
    } catch (err) {
      throw new BadRequestException(
        `Error occur fetching url => ${err.message} `,
      );
    }
  }

  async uploadTemplate(file, name, account_id) {
    const filekey = `${uuidv4()}-${name}-template.pdf`;
    try {
      await this.awsS3Config.getS3().putObject({
        Bucket: account_id,
        Key: `templates/${filekey}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      return filekey;
    } catch (error) {
      throw new Error('Error occur while upload');
    }
  }

  async downloadTemplate(account_id: string, key: string, type: string | null) {
    try {
      const bucketParams = {
        Bucket: account_id,
        Key: `templates/${key}`,
      };
      const response = await this.awsS3Config.getS3().getObject(bucketParams);

      if (type === 'url') {
        return await getSignedUrl(
          this.awsS3Config.getS3(),
          new GetObjectCommand(bucketParams),
          { expiresIn: 600 },
        );
      }
      return response.Body as Readable;
    } catch (error) {
      if (error.Code === 'NoSuchKey') {
        throw new BadRequestException('Invalid filename');
      }
      throw new BadRequestException(
        `Error occur fetching url => ${error.message} `,
      );
    }
  }

  streamPipeline = promisify(pipeline);

  async downloadContracts(account_id: string, key: string): Promise<string> {
    try {
      const response = await this.awsS3Config.getS3().getObject({
        Bucket: account_id,
        Key: `contracts/${key}`,
      });

      const tempFilePath = path.join(
        '/tmp',
        `${Date.now()}-${path.basename(key)}`,
      );

      if (!response.Body) {
        throw new BadRequestException('File content is empty');
      }

      const writableStream = fs.createWriteStream(tempFilePath);

      await this.streamPipeline(response.Body as Readable, writableStream);

      return tempFilePath;
    } catch (error) {
      if (error.Code === 'NoSuchKey') {
        throw new BadRequestException('Invalid filename');
      }
      throw new BadRequestException(
        `Error occurred fetching file => ${error.message}`,
      );
    }
  }
}
