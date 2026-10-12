/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Module } from '../modules/module.entity';
import { Question } from '../questions/question.entity';
import { CreateIndicatorDto, IndicatorUpdateDto } from './indicator.dto';
import { Indicator } from './indicator.entity';

interface IndicatorFilterParams {
  is_deleted?: boolean;
  search?: string;
  limit?: number;
  page?: number;
  sort?: any; // You might want to type this more specifically based on your sorting needs
  filter?: any;
  module?: string;
}

@Injectable()
export class IndicatorService {
  constructor(
    @InjectRepository(Indicator)
    private readonly indicatorModel: Repository<Indicator>,
    private readonly dataSource: DataSource,
  ) {}

  async getAll(name: string) {
    return await this.indicatorModel.findOne({
      where: { name, is_deleted: false },
      relations: ['module'],
    });
  }

  async createIndicator(body: CreateIndicatorDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const indicator = await this.indicatorModel.findOne({
        where: { name: body.name },
      });
      if (indicator) {
        throw new BadRequestException('Indicator already exist');
      }

      const module = await queryRunner.manager
        .getRepository(Module)
        .findOne({ where: { id: body.module_id } });
      if (!module) {
        throw new BadRequestException('Module not found');
      }

      const Indicator = await this.indicatorModel.save({
        name: body.name,
        description: body.description,
        module,
      });

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Indicator created successfully',
        data: Indicator,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getAllIndicator(params: IndicatorFilterParams) {
    const { limit, page, sort, filter } = params;

    const whereConditions: any = {
      is_deleted: filter.is_deleted !== undefined ? filter.is_deleted : false,
    };

    const query: any = {
      take: limit,
      order: sort,
      // skip,
      where: whereConditions,
      relations: ['module', 'questions'],
    };

    if ('search' in filter) {
      const { search } = filter;
      query.where = { ...query.where, name: ILike(`%${search}%`) };
    }

    if ('module' in filter) {
      query.where = { ...query.where, module: { id: params.filter.module } };
    }

    const [data, totalCount] = await this.indicatorModel.findAndCount(query);
    return {
      success: true,
      indicators: data,
      meta: {
        currentCount: data.length,
        currentPage: Number(page),
        currentLimit: Number(limit),
        totalCount,
      },
    };
  }

  async getIndicatorById(id: string) {
    try {
      const indicator = await this.indicatorModel.findOne({
        where: { id, is_deleted: false },
        relations: ['module'],
      });

      if (!indicator || indicator.is_deleted === true) {
        throw new BadRequestException('Indicator not found');
      }

      return {
        success: true,
        indicators: indicator,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateIndicator(id: string, body: IndicatorUpdateDto) {
    try {
      const indicator = await this.indicatorModel.findOne({
        where: { id, is_deleted: false },
      });

      if (!indicator) {
        throw new BadRequestException('Indicator not found');
      }

      const module = await this.dataSource
        .getRepository(Module)
        .findOne({ where: { id: body.module_id } });

      const updateData = {
        name: body.name,
        description: body.description,
        module,
      };

      // const _updateData = {
      //   name: body.name,
      //   ...(body.description && { description: body.description }),
      // };

      await this.indicatorModel.update(id, updateData);

      return {
        success: true,
        indicators: 'Indicator updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteIndicator(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const indicator = await this.indicatorModel.findOne({
        where: { id, is_deleted: false },
      });

      if (!indicator) {
        throw new BadRequestException('Indicator not found');
      }

      await queryRunner.manager
        .getRepository(Indicator)
        .update(id, { is_deleted: true });

      await queryRunner.manager
        .getRepository(Question)
        .update({ indicator: { id } }, { indicator: null });

      await queryRunner.commitTransaction();

      return {
        success: true,
        indicator: 'Indicator deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
