/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Indicator } from '../indicators/indicator.entity';
import { CreateModuleDto, UpdateModuleDto } from './module.dto';
import { Module } from './module.entity';

/**
 * Service for handling module-related operations
 */
@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(Indicator)
    private readonly indicatorRepository: Repository<Indicator>,
  ) {}

  /**
   * Creates a new module
   * @param createModuleDto - Data for creating the module
   * @returns Created module
   * @throws BadRequestException if module with same name exists
   */
  async createModule(createModuleDto: CreateModuleDto) {
    try {
      const existingModule = await this.moduleRepository.findOne({
        where: { name: createModuleDto.name },
      });

      if (existingModule) {
        throw new BadRequestException('Module with this name already exists');
      }

      const module = this.moduleRepository.create(createModuleDto);
      await this.moduleRepository.save(module);

      return {
        success: true,
        message: 'Module created successfully',
        data: module,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create module');
    }
  }

  /**
   * Updates an existing module
   * @param id - ID of the module to update
   * @param updateModuleDto - Data for updating the module
   * @returns Updated module
   * @throws BadRequestException if module with same name exists
   */
  async updateModule(id: string, updateModuleDto: UpdateModuleDto) {
    try {
      const module = await this.getModuleById(id);

      if (updateModuleDto.name) {
        const existingModule = await this.moduleRepository.findOne({
          where: { name: updateModuleDto.name },
        });

        if (existingModule && existingModule.id !== id) {
          throw new BadRequestException('Module with this name already exists');
        }
      }

      Object.assign(module, updateModuleDto);
      await this.moduleRepository.save(module);

      return {
        success: true,
        message: 'Module updated successfully',
        data: module,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update module');
    }
  }

  /**
   * Retrieves a module by ID
   * @param id - ID of the module to retrieve
   * @returns Module
   * @throws BadRequestException if module not found
   */
  async getModuleById(id: string) {
    const module = await this.moduleRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['indicators', 'indicators.questions.sub_indicator'],
    });

    if (!module || module.is_deleted === true) {
      throw new NotFoundException('Module not found');
    }

    // Filter out deleted indicators and their questions
    module.indicators = module.indicators.filter(
      (indicator) => !indicator.is_deleted,
    );
    module.indicators.forEach((indicator) => {
      indicator.questions = indicator.questions.filter(
        (question) => !question.is_deleted,
      );
    });

    return module;
  }

  /**
   * Soft deletes a module
   * @param id - ID of the module to delete
   * @returns Success message
   * @throws BadRequestException if module not found
   */
  async deleteModule(id: string) {
    try {
      // Update related indicators
      await this.indicatorRepository.update(
        { module: { id } },
        { module: null },
      );

      // Soft delete the module
      await this.moduleRepository.update(id, {
        is_deleted: true,
        deleted_at: new Date(),
      });

      return {
        success: true,
        message: 'Module deleted successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete module');
    }
  }

  /**
   * Retrieves all modules with pagination and filtering
   * @param filter - Filter criteria
   * @returns Paginated modules
   */
  async getAllModules(params: any) {
    try {
      const { limit, page, skip, sort, filter } = params;

      const whereConditions: any = {
        is_deleted: filter.is_deleted !== undefined ? filter.is_deleted : false,
      };

      const query = {
        take: limit,
        skip,
        order: sort,
        where: whereConditions,
        relations: ['indicators', 'indicators.questions.sub_indicator'],
      };

      if (filter.search) {
        query.where = { ...query.where, name: ILike(`%${filter.search}%`) };
      }

      const [data, totalCount] = await this.moduleRepository.findAndCount({
        ...query,
        order:
          typeof sort === 'string'
            ? { [sort.split(':')[0]]: sort.split(':')[1] }
            : sort,
        relations: ['indicators', 'indicators.questions.sub_indicator'],
      });

      // Filter out deleted indicators and their questions
      const filteredData = data.map((module) => {
        module.indicators = module.indicators.filter(
          (indicator) => !indicator.is_deleted,
        );
        module.indicators.forEach((indicator) => {
          indicator.questions = indicator.questions.filter(
            (question) => !question.is_deleted,
          );
        });
        return module;
      });

      // Apply indicatorId filter if provided
      const finalData = filter.indicatorId
        ? filteredData.filter((module) =>
            module.indicators.some(
              (indicator) => indicator.id === filter.indicatorId,
            ),
          )
        : filteredData;

      return {
        success: true,
        data: finalData,
        meta: {
          currentCount: finalData.length,
          currentPage: Number(page),
          currentLimit: Number(limit),
          totalCount: filter.indicatorId ? finalData.length : totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve modules');
    }
  }
}
