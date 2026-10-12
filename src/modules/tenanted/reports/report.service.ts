/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { DataSource, Repository } from 'typeorm';
import { Datacube } from '../datacubes/datacube.entity';
import { CreateReportTemplateDto } from './report.dto';
import { ReportTemplate } from './report.entity';

@Injectable()
export class ReportTemplateService {
  private readonly reportTemplateModel: Repository<ReportTemplate>;

  private readonly datacubeModel: Repository<Datacube>;

  private readonly connection: DataSource;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.connection = connection;
    this.reportTemplateModel = connection.getRepository(ReportTemplate);
    this.datacubeModel = connection.getRepository(Datacube);
  }

  async getReports() {
    return this.reportTemplateModel.find({
      relations: ['datacube'],
    });
  }

  async createReport(datacube_id: string, standard_id: string) {
    try {
      const datacube = await this.datacubeModel.findOne({
        where: { id: datacube_id },
      });

      if (!datacube) {
        throw new BadRequestException('Datacube not found');
      }

      // Find the specific standard the user selected
      const selectedStandard = datacube.standards.find(
        (std) => std.id === standard_id,
      );

      if (!selectedStandard) {
        throw new BadRequestException(
          'Selected standard not found in datacube',
        );
      }

      const reportName = `${datacube.name}_${selectedStandard.name}`;

      const existingReport = await this.reportTemplateModel.findOne({
        where: {
          datacube: { id: datacube_id },
          standard_id, // Also check for same standard
        },
      });

      if (existingReport) {
        throw new BadRequestException(
          'Report already exists for this datacube and standard',
        );
      }

      const reportTemplate = this.reportTemplateModel.create({
        report_name: reportName,
        type: 'download-report',
        url: datacube.frequency,
        standard: selectedStandard.name,
        standard_id: selectedStandard.id,
        financial_year: datacube.financial_year,
        datacube,
      });

      const savedReport = await this.reportTemplateModel.save(reportTemplate);
      return savedReport;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async checkReportStatus(id: string) {
    return this.reportTemplateModel.findOne({ where: { id } });
  }

  async getReportById(id: string) {
    return this.reportTemplateModel.findOne({ where: { id } });
  }

  async deleteReport(id: string) {
    try {
      return this.reportTemplateModel.delete(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getReportSummary(datacube_id: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // === Validate datacube and fetch config ===
      const datacube = await queryRunner.manager
        .getRepository(Datacube)
        .findOne({
          where: { id: datacube_id },
          relations: [
            'datacube_frequency',
            'datacube_frequency.datacube_config',
          ],
        });

      if (!datacube) {
        throw new BadRequestException('Datacube not found');
      }

      // pick the first config attached to this datacube
      const config = datacube.datacube_frequency?.[0]?.datacube_config;
      const start_date = config?.start_date ?? null;
      const end_date = config?.end_date ?? null;

      // === Calculate duration between start and end ===
      const durationDays =
        start_date && end_date
          ? Math.ceil(
              (end_date.getTime() - start_date.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

      // === Fetch all reports for this datacube ===
      const reports = await queryRunner.manager
        .getRepository(ReportTemplate)
        .find({
          where: { datacube: { id: datacube_id }, is_deleted: false },
          relations: ['datacube'],
        });

      const totalReports = reports.length;

      let inProcessCount = 0;
      let completedCount = 0;
      let overdueCount = 0;
      let targetDate: Date | null = null;
      let estimateDaysLeft = 0;

      for (const r of reports) {
        if (r.status === 'completed') {
          completedCount++;
        } else if (['pending', 'in_process'].includes(r.status)) {
          // original FY end date
          const fyEndYear = parseInt(r.financial_year.split('-')[1], 10);
          const fyEndDate = new Date(fyEndYear, 2, 31); // March 31

          // new target date = fyEndDate + durationDays
          targetDate = new Date(fyEndDate);
          targetDate.setDate(targetDate.getDate() + durationDays);

          // check overdue
          if (new Date() > targetDate) {
            overdueCount++;
          } else {
            inProcessCount++;
          }

          // estimate days left (clamp at 0)
          const diffDays = Math.ceil(
            (targetDate.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );
          estimateDaysLeft = diffDays > 0 ? diffDays : 0;
        }
      }

      // === Response ===
      return {
        success: true,
        message: 'Report summary fetched successfully',
        data: {
          datacube_id,
          start_date,
          end_date,
          totalReports,
          inProcessCount,
          completedCount,
          overdueCount,
          durationDays,
          targetDate,
          estimateDaysLeft,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error fetching report summary: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
