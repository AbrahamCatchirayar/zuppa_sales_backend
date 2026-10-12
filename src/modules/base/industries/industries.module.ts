import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { env } from 'process';
import { Industries } from './industries.entity';
import { IndustryController } from './industries.controller';
import { IndustryService } from './industries.service';
import { SectorsModule } from '../sectors/sectors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Industries]),
    SectorsModule,
    ClientsModule.register([
      {
        name: 'INDUSTRY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [env.RABBITMQ_URL],
          queue: env.INDUSRTY_QUEUE,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [IndustryController],
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustriesModule {}
