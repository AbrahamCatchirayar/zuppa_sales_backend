import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandardModule } from 'src/modules/base/standards/standard.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { env } from 'src/config';
import { AuthModule } from '../auth/auth.module';
import { ReportTemplate } from './report.entity';
import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module';
import { ReportTemplateController } from './report.controller';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ReportTemplateService } from './report.service';
import { Job } from './job.entity';
import { DatacubeModule } from '../datacubes/datacube.module';
import { Datacube } from '../datacubes/datacube.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportTemplate, Job, Datacube]),
    AuthModule,
    AccountModule,
    StandardModule,
    DatacubeModule,
    ClientsModule.register([
      {
        name: 'JOB_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [env.rabbitmq_url],
          queue: env.job_queue,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [ReportTemplateController, JobController],
  providers: [JobService, ReportTemplateService],
  exports: [JobService, ReportTemplateService],
})
export class ReportTemplateModule {}
