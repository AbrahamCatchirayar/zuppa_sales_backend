import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { JobService } from './job.service';
import { ReportTemplateService } from './report.service';
import { StandardDto } from './report.dto';

@Controller('v1/report-template')
@ApiTags('TENENT_AUTH REPORT_TEMPLATE')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('USER')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class ReportTemplateController {
  constructor(
    private readonly reportService: ReportTemplateService,
    private readonly jobService: JobService,
  ) {}

  @Get('get-report-templates')
  async getReportTemplates() {
    const reportTemplates = await this.reportService.getReports();
    return {
      success: true,
      data: reportTemplates,
    };
  }

  @Post(':datacube_id/create-report')
  async createReport(
    @Param('datacube_id') datacube_id: string,
    @Body() body: StandardDto,
    @Request() req: any,
  ) {
    const report = await this.reportService.createReport(
      datacube_id,
      body.standard_id,
    );
    const token = req.headers.authorization.split(' ')[1];
    const { tenantId } = req;
    await this.jobService.processJob(
      'download-report',
      report,
      req.user,
      token,
      tenantId,
    );
    return {
      success: true,
      data: report,
    };
  }

  @Get('check-report-status/:id')
  async checkReportStatus(@Param('id') id: string) {
    const reportTemplates = await this.reportService.checkReportStatus(id);
    return {
      success: true,
      data: reportTemplates,
    };
  }

  @Get('/:report_id/download-report')
  async downloadReport(
    @Param('report_id') report_id: string,
    @Request() req: any,
  ) {
    try {
      const job = await this.reportService.getReportById(report_id);
      return {
        success: true,
        data: job,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete(':id/delete-report')
  async deleteReport(@Param('id') id: string) {
    try {
      const report = await this.reportService.getReportById(id);
      if (!report) {
        throw new BadRequestException('Report not found');
      }
      await this.reportService.deleteReport(id);
      return {
        success: true,
        data: 'Report deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(':datacube_id/summary')
  async getReportSummary(@Param('datacube_id') datacubeId: string) {
    return this.reportService.getReportSummary(datacubeId);
  }
}
