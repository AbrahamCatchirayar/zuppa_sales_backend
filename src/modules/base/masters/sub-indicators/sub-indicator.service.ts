/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { BadRequestException, Query } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { getStatusValue } from 'src/utils';
import { DataSource, ILike, Repository } from 'typeorm';
import {
  CreateSubIndicatorDto,
  UpdateSubIndicatorDto,
} from './sub-indicator.dto';
import { SubIndicator } from './sub-indicator.entity';

export class SubIndicatorService {
  constructor(
    @InjectRepository(SubIndicator)
    private readonly subIndicatorModel: Repository<SubIndicator>,
    @InjectDataSource()
    private readonly datasource: DataSource,
  ) {}

  async createSubIndicator(param: CreateSubIndicatorDto) {
    const connection = await this.datasource.createQueryRunner();
    await connection.startTransaction();
    try {
      const _indicator = await this.subIndicatorModel.findOne({
        where: { name: param.name },
      });
      if (_indicator) {
        throw new BadRequestException('Sub-Indicator already exist');
      }

      const subIndicator = await connection.manager
        .getRepository(SubIndicator)
        .save({
          name: param.name,
          description: param.description,
        });

      await connection.commitTransaction();
      return {
        success: true,
        message: 'Sub-Indicator created successfully ',
        data: subIndicator,
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await connection.release();
    }
  }

  async getSubIndicatorById(id: string) {
    try {
      const subInd = await this.subIndicatorModel.findOne({
        where: { id, is_deleted: false },
        relations: ['questions', 'questions.question_options'],
      });

      if (!subInd || subInd.is_deleted === true) {
        throw new BadRequestException('Indicator not found');
      }

      subInd.questions = subInd.questions.filter(
        (questions) => !questions.is_deleted,
      );

      subInd.questions.forEach((question) => {
        question.question_options = question.question_options.filter(
          (option) => !option.is_deleted,
        );
      });

      return {
        success: true,
        data: subInd,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllSubIndicators(@Query() param: any) {
    try {
      const { limit, skip, sort, page, filter, indicator, questions, status } =
        param;
      const Query: any = {
        take: limit,
        skip,
        order: sort,
        where: { is_deleted: false },
        relations: ['questions', 'questions.question_options'],
      };

      if (Query.questions) {
        const quest = await this.subIndicatorModel.findOne({
          where: { id: questions },
        });
        if (!quest) throw new BadRequestException('Question not found');
      }
      if ('search' in filter) {
        const { search } = filter;
        delete filter.search;
        Query.where = { ...Query.where, name: ILike(`%${search}%`) };
      } else {
        Query.where = { ...Query.where, ...filter };
      }

      if ('indicator' in filter) {
        const { indicator } = filter;
        Query.where = { ...Query.where, indicator: { name: indicator } };
      }
      const [data, totalCount] =
        await this.subIndicatorModel.findAndCount(Query);

      const filteredData = data.map((subindicator) => {
        subindicator.questions = subindicator.questions.filter(
          (question) => !question.is_deleted,
        );
        subindicator.questions.forEach((question) => {
          question.question_options = question.question_options.filter(
            (option) => !option.is_deleted,
          );
        });
        return subindicator;
      });

      const filteredIndicators = filteredData.filter((subindicator) => {
        const indicatorStatus = getStatusValue(subindicator, 'subindicator');
        return status
          ? indicatorStatus === status
          : ['ACTIVE', 'PENDING', 'INACTIVE'].includes(indicatorStatus);
      });

      return {
        success: true,
        subindicators: filteredIndicators,
        meta: {
          currentCount: filteredIndicators.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateSubIndicator(id: string, param: UpdateSubIndicatorDto) {
    const connection = this.datasource.createQueryRunner();
    await connection.startTransaction();
    try {
      const subIndicator: any = await this.subIndicatorModel.findOne({
        where: { id },
      });
      if (!subIndicator)
        throw new BadRequestException('Sub Indicator not found');

      const response = await connection.manager
        .getRepository(SubIndicator)
        .update(id, {
          name: param?.name,
          description: param?.description,
        });

      await connection.commitTransaction();
      return {
        success: true,
        message: 'Sub Indicator updated successfully',
        data: response,
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await connection.release();
    }
  }

  async deleteSubIndicator(id: string) {
    try {
      const subIndicator = await this.subIndicatorModel.findOne({
        where: { id },
      });
      if (!subIndicator)
        throw new BadRequestException('Sub Indicator not found');

      await this.subIndicatorModel.update(id, {
        deleted_at: new Date(),
        is_deleted: true,
      });
      return {
        success: true,
        message: 'Sub Indicator deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async reActivateDelete(id: string) {
    try {
      const subIndicator = await this.subIndicatorModel.findOne({
        where: { id },
        withDeleted: true,
      });
      if (!subIndicator)
        throw new BadRequestException('Sub Indicator not found');

      await this.subIndicatorModel.update(id, {
        deleted_at: null,
        is_deleted: false,
      });
      return {
        success: true,
        message: 'Sub Indicator reactivated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
