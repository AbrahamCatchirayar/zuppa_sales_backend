import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { CreateReportTemplateDto } from './report.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @Inject('JOB_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  async createJob(params: CreateReportTemplateDto) {
    try {
      const job = this.jobRepository.create({
        report_name: params.report_name,
        type: 'download-report',
        status: JobStatus.Pending,
      });
      const savedJob = await this.jobRepository.save(job);
      return savedJob;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async processJob(
    pattern: string,
    data: any,
    user: any,
    token: string,
    tenantId: string,
  ) {
    try {
      const job = {
        ...data,
        user,
        token,
        tenantId,
      };
      await this.client.emit(pattern, job);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
