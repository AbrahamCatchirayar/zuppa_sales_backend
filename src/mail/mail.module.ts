import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from 'dotenv';
import { MailServiceRq } from './mail.service';

config();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: process.env.QUEUE_NAME,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [MailServiceRq],
  exports: [MailServiceRq],
})
export class MailModule {}
