/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/await-thenable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { getStatusValue } from 'src/utils';
import { DataSource, ILike, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Industries } from '../industries/industries.entity';
import { SectorDto } from './sectors.dto';
import { Sectors } from './sectors.entity';

interface Sector {
  name: string;
}

@Injectable()
export class SectorService {
  constructor(
    @InjectRepository(Sectors)
    private readonly sectorModel: Repository<Sectors>,
    @InjectDataSource()
    private readonly datasource: DataSource,
  ) {}

  async createSector(body: SectorDto) {
    const connection = await this.datasource.createQueryRunner();
    await connection.startTransaction();
    try {
      const existingSector = await connection.manager
        .getRepository(Sectors)
        .findOne({
          where: { name: ILike(body.sector_name.toLowerCase()) },
        });
      if (existingSector) {
        throw new BadRequestException('Sector already exists');
      }

      const sector = await connection.manager
        .getRepository(Sectors)
        .save({ name: body.sector_name });

      if (body?.industries?.length > 0) {
        const response = body.industries.map(async (industry) => {
          const _industry = await connection.manager
            .getRepository(Industries)
            .findOne({ where: { id: industry } });

          if (!_industry || _industry.sector) {
            throw new BadRequestException('Invalid sector');
          }
          await connection.manager
            .getRepository(Industries)
            .update(_industry.id, { sector: { id: sector.id } });
        });
        await Promise.all(response);
      }
      await connection.commitTransaction();
      return {
        success: true,
        message: 'SECTOR CREATED SUCCESSFULLY',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await connection.release();
    }
  }

  async uploadSector(fileBuffer: Buffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in the uploaded file');
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error('Sheet not found in the uploaded file');
      }

      const data: Sector[] = XLSX.utils.sheet_to_json(sheet);

      const existingSectors = await this.sectorModel.find({
        select: ['name'],
      });

      const existingNamesSet = new Set(
        existingSectors.map((sector) => sector.name),
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
            message: `Duplicate sector name found: ${item.name}`,
          };
        }
      }
      if (uniqueData.length > 0) {
        await this.sectorModel.save(uniqueData);
        return {
          success: true,
          message: 'Sectors list saved successfully.',
        };
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllSectors(params) {
    try {
      const { limit, skip, sort, page, filter } = params;

      const { search, status, ...otherFilters } = filter;
      const whereConditions = { ...otherFilters };
      if (search) {
        whereConditions.name = ILike(`%${search}%`);
      }

      const query = {
        take: limit,
        skip,
        order: sort,
        where: whereConditions,
        relations: ['industry'],
      };

      const [data, totalCount] = await this.sectorModel.findAndCount(query);

      const filteredData = data.map((sector) => ({
        ...sector,
        industry: sector.industry.filter((ind) => !ind.is_deleted),
      }));

      const filteredSectors = filteredData.filter((sector) => {
        const sectorStatus = getStatusValue(sector, 'sector');
        return status
          ? sectorStatus === status
          : ['ACTIVE', 'PENDING', 'INACTIVE'].includes(sectorStatus);
      });
      return {
        success: true,
        sectors: filteredSectors,
        meta: {
          currentCount: filteredSectors.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async getSectors() {
    try {
      const sectors = await this.sectorModel.find({ relations: ['industry'] });
      return {
        success: true,
        data: sectors,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getSector(id: string) {
    try {
      const sector = await this.sectorModel.findOne({
        where: { id },
        relations: ['industry'],
      });

      if (!sector) {
        throw new BadRequestException('Sector not found');
      }

      return { success: true, sector };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async updateSector(id: string, params: SectorDto) {
    const connection = await this.datasource.createQueryRunner();
    await connection.startTransaction();
    try {
      await connection.manager
        .getRepository(Sectors)
        .update(id, { name: params.sector_name });

      const _sector = await this.sectorModel.findOne({
        where: { id },
        relations: ['industry'],
      });

      if (!_sector) throw new BadRequestException('Sector not found');

      if (params?.industries?.length > 0) {
        const industryRepository = connection.manager.getRepository(Industries);
        const unmatchedIndustryIds = _sector?.industry
          .filter((item) => !params.industries.includes(item?.id))
          .map((item) => item?.id);
        const updateMatchedIndustries = params.industries.map(
          async (industryId) => {
            const industry = await industryRepository.findOne({
              where: { id: industryId },
            });
            if (!industry) {
              throw new BadRequestException('Invalid industry');
            }
            return industryRepository.update(industryId, { sector: _sector });
          },
        );
        await Promise.all(
          unmatchedIndustryIds.map(async (industry) => {
            await connection.manager
              .getRepository(Industries)
              .createQueryBuilder()
              .update()
              .set({ sector: null })
              .where('id = :id', { id: industry })
              .execute();
          }),
        );
        await Promise.all(updateMatchedIndustries);
      }

      await connection.commitTransaction();

      return {
        success: true,
        message: `sector details successfully updated `,
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await connection.release();
    }
  }

  async deleteSector(id: string) {
    const connection = await this.datasource.createQueryRunner();
    try {
      const sector = await this.sectorModel.findOne({
        where: { id },
        relations: ['industry'],
      });

      if (!sector) {
        throw new BadRequestException('Invalid sector');
      }

      await Promise.all(
        sector.industry.map(async (industry) => {
          await connection.manager
            .getRepository(Industries)
            .createQueryBuilder()
            .update()
            .set({ sector: null })
            .where('id = :id', { id: industry.id })
            .execute();
        }),
      );

      await this.sectorModel.update(id, {
        is_deleted: true,
        deleted_at: new Date(),
      });

      return {
        success: true,
        message: `Sector deleted successfully`,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async reActivateDelete(id: string) {
    try {
      const sector = await this.sectorModel.findOne({
        where: { id, is_deleted: true },
      });
      if (!sector) {
        throw new BadRequestException('Account already exist');
      }

      await this.sectorModel.update(id, { is_deleted: false });
      return {
        success: true,
        message: `Sector Activated Successfully`,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
