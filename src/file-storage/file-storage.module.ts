import { Module } from '@nestjs/common';
import { FileService } from './file-storage.service';
import { AwsS3Config } from './aws.config';

@Module({
  providers: [FileService, AwsS3Config],
  exports: [FileService, AwsS3Config],
})
export class FileStorageModule {}
