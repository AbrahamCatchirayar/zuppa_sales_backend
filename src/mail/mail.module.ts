import { Module } from '@nestjs/common';
import { MailServiceRq } from './mail.service';

@Module({
  providers: [MailServiceRq],
  exports: [MailServiceRq],
})
export class MailModule {}
