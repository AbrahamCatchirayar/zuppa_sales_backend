/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { getStatusValue } from 'src/utils';
import { DataSource, ILike, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { SectorService } from '../sectors/sectors.service';
import { IndustryDto, UpdateIndustryDto } from './industries.dto';
import { Industries } from './industries.entity';
import { Sectors } from '../sectors/sectors.entity';

interface Industry {
  name: string;
}

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industries)
    private readonly industryModel: Repository<Industries>,
    private readonly sectorService: SectorService,
    @InjectDataSource() private readonly datasource: DataSource,
    @Inject('INDUSTRY_SERVICE') private readonly client: ClientProxy,
  ) {}

  async createIndustry(params: IndustryDto) {
    try {
      const existingIndustry = await this.industryModel.findOne({
        where: { name: ILike(params.industry_name.toLowerCase()) }
      });
      if (existingIndustry) {
        throw new BadRequestException('Industry already exists');
      } 

      const _industry = {
        name: params.industry_name,
        description: params.description,
        sector: null,
      };

      if (params.sector) {
        const sector = await this.sectorService.getSector(params.sector);
        _industry.sector = sector.sector;
        if (!sector) {
          throw new BadRequestException('Invalid sector');
        }
      }

      const industry = await this.industryModel.save(_industry);
      return { success: true, industry };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async uploadIndustry(fileBuffer: Buffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in the uploaded file');
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error('Sheet not found in the uploaded file');
      }

      const data: Industry[] = XLSX.utils.sheet_to_json(sheet);

      const existingIndustries = await this.industryModel.find({
        select: ['name'],
      });

      const existingNamesSet = new Set(
        existingIndustries.map((industry) => industry.name),
      );

      const uniqueData = [];
      for (const item of data) {
        if (item.name && !existingNamesSet.has(item.name)) {
          uniqueData.push(item);
          existingNamesSet.add(item.name);
        } else if (item.name === undefined) {
          throw new BadRequestException(
            'Column name mismatch/Incorrect Excel sheet',
          );
        } else {
          return {
            success: false,
            message: `Duplicate industry name found: ${item.name}`,
          };
        }
      }
      if (uniqueData.length > 0) {
        await this.industryModel.save(uniqueData);
        return {
          success: true,
          message: 'Industries list saved successfully.',
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllIndustries(params) {
    try {
      const { limit, skip, sort, page, filter } = params;
      const { search, status, ...otherFilters } = filter;
      const whereConditions = {
        ...otherFilters,
        is_deleted: false,
      };

      if (filter.is_deleted === true) {
        whereConditions.is_deleted = true;
      }

      if (search) {
        whereConditions.name = ILike(`%${search}%`);
      }

      const query = {
        take: limit,
        skip,
        order: sort,
        where: whereConditions,
        relations: ['sector'],
      };

      if ('sector' in filter) {
        const { sector } = filter;
        query.where = {
          ...query.where,
          sector: { name: sector },
        };
        delete filter.sector;
      }

      const [data, totalCount] = await this.industryModel.findAndCount(query);

      const filteredIndustry = data.filter((sector) => {
        const sectorStatus = getStatusValue(sector, 'industry');
        return status
          ? sectorStatus === status
          : ['ACTIVE', 'PENDING', 'INACTIVE'].includes(sectorStatus);
      });
      return {
        success: true,
        industries: filteredIndustry,
        meta: {
          currentCount: filteredIndustry.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async getIndustryById(id: string) {
    try {
      const industry = await this.industryModel.findOne({
        where: { id },
        relations: ['sector'],
      });

      if (industry.sector.is_deleted === true) {
        industry.sector = null;
      }

      if (!industry) {
        throw new BadRequestException('Industry not found');
      }

      return { success: true, industries: industry };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async updateIndustry(id: string, params: UpdateIndustryDto) {
    const connection = await this.datasource.createQueryRunner();
    await connection.startTransaction();
    try {
      const industry = await this.industryModel.findOne({
        where: { id },
      });

      if (!industry) {
        throw new BadRequestException('Industry not found');
      }

      await connection.manager.getRepository(Industries).update(id, {
        name: params.industry_name,
        description: params.description,
      });

      if (params.sector) {
        const _sector = await connection.manager
          .getRepository(Sectors)
          .findOne({ where: { id: params.sector } });

        if (!_sector || industry.sector) {
          throw new BadRequestException('Invalid sector');
        }

        await connection.manager
          .getRepository(Industries)
          .update(industry.id, { sector: _sector });
      }

      await connection.commitTransaction();
      return {
        success: true,
        message: 'INDUSTRY SUCCESSFULLY UPDATED',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error.message || error);
    } finally {
      await connection.release();
    }
  }

  async deleteIndustry(id: string) {
    const connection = this.datasource.createQueryRunner();
    try {
      const industry = await this.industryModel.findOne({
        where: { id },
        relations: ['sector'],
      });

      if (!industry) {
        throw new BadRequestException('Industry not found');
      }

      if (industry.sector) {
        const sectorRepository = connection.manager.getRepository(Sectors);
        const sector = await sectorRepository.findOne({
          where: { id: industry.sector.id },
          relations: ['industry'],
        });

        if (sector) {
          const updatedIndustries = sector.industry.filter(
            (item) => item.id !== industry.id,
          );
          sector.industry = updatedIndustries?.length
            ? updatedIndustries
            : null;

          await sectorRepository.save(sector);
        }
      }

      await this.industryModel.update(id, {
        is_deleted: true,
        deleted_at: new Date(),
        sector: null,
      });
      return {
        success: true,
        message: 'IDUSTRY DELETED SUCCESSFULLY',
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to delete industry',
      );
    }
  }

  async reActivateDelete(id: string) {
    try {
      const industry = await this.industryModel.findOne({
        where: { id, is_deleted: true },
      });
      if (!industry) {
        throw new BadRequestException('Account already exist');
      }

      await this.industryModel.update(id, {
        is_deleted: false,
        deleted_at: null,
      });
      return {
        success: true,
        message: `industry Activated Successfully`,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
