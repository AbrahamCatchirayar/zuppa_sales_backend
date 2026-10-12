import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  // @Get(':id')
  // async getJobById(@Param('id') id: string) {
  // 	const job = await this.jobService.checkReportStatus(id);
  // 	if (!job) throw new NotFoundException("Job not found");
  // 	return {
  // 		success: true,
  // 		data: job,
  // 	};
  // }
}
