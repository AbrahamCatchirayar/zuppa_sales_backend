import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { StandardIndicator } from './standard_indicator.entity';
import { IndicatorService } from '../../masters/indicators/indicator.service';
import { Standard } from '../standard.entity';
import { StandardModule } from '../standard_modules/standard_module.entity';
import { IndicatorsRemove } from './standard_indicator.dto';

@Injectable()
export class StandardIndicatorService {
  constructor(
    @InjectRepository(StandardIndicator)
    private readonly standardIndicatorModel: Repository<StandardIndicator>,
    private readonly masterIndicatorService: IndicatorService,
    private readonly dataSource: DataSource,
  ) {}

  async createIndicator(body: { name: string }) {
    try {
      const indicatorExist = await this.standardIndicatorModel.findOne({
        where: { name: body.name },
      });
      if (indicatorExist)
        throw new BadRequestException('Indicator already exist');
      const indicator = await this.masterIndicatorService.getAll(body.name);
      if (!indicator)
        throw new BadRequestException('Not found master indicator');

      // indicators.map(async (indicator) => {
      //   const ind = await this.standardIndicatorModel.save({ name: indicator.name, is_deleted: indicator.is_deleted })
      // })

      await this.standardIndicatorModel.save({
        name: indicator.name,
        is_deleted: indicator.is_deleted,
      });

      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getAllStandardIndicators(param: any) {
    try {
      const { page, limit, skip, sort, filter } = param;

      const query = {
        take: limit,
        skip,
        order: sort,
        where: {
          is_deleted: undefined,
          name: undefined,
          master_indicator_id: undefined,
        },
        relations: [
          'standard_questions',
          'standard_modules_id',
          'master_indicator_id',
        ],
      };

      if ('is_deleted' in filter) {
        query.where.is_deleted = filter.is_deleted;
      }

      if ('search' in filter) {
        const { search } = filter;
        query.where = { ...query.where, name: ILike(`%${search}%`) };
      }

      if ('masterIndicatorId' in filter) {
        query.where = {
          ...query.where,
          master_indicator_id: { id: filter.masterIndicatorId },
        };
      }

      const [data, totalCount] =
        await this.standardIndicatorModel.findAndCount(query);

      return {
        success: true,
        Standard_modules: data,
        meta: {
          currentCount: data.length,
          currentPage: Number(page),
          currentLimit: Number(limit),
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async removeIndicators(
    standard_id: string,
    module_id: string,
    indicator_ids: IndicatorsRemove,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const standard = await queryRunner.manager
        .getRepository(Standard)
        .findOne({ where: { id: standard_id } });

      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      const module = await queryRunner.manager
        .getRepository(StandardModule)
        .findOne({
          where: { id: module_id, standard: { id: standard_id } },
        });

      if (!module) {
        throw new BadRequestException('module not found');
      }

      const indicatorsToRemove = await queryRunner.manager
        .getRepository(StandardIndicator)
        .find({
          where: {
            id: In(indicator_ids.id),
            standard_modules: { id: module.id },
          },
        });

      for (const indicator of indicatorsToRemove) {
        ((indicator.is_deleted = true), (indicator.standard_modules = null));
      }

      await queryRunner.manager
        .getRepository(StandardIndicator)
        .save(indicatorsToRemove);

      await queryRunner.commitTransaction();

      return { success: true, message: 'Indicator removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
