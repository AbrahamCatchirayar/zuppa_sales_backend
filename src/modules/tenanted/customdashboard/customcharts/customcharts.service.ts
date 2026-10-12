import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { CustomItem } from './entities/item.entity';
import { CustomType } from './entities/type.entity';
import { CustomCombinedParameter } from './entities/combined_parameter.entity';
import { CustomParameter } from './entities/custom_parameter.entity';
import { CustomTypeDto, CustomTypeUpdateDto } from './customcharts.dto';

@Injectable()
export class CustomChartsService {
  constructor(
    @InjectRepository(CustomItem)
    private readonly customItemRepository: Repository<CustomItem>,
    @InjectRepository(CustomType)
    private readonly customTypeRepository: Repository<CustomType>,
    @InjectRepository(CustomCombinedParameter)
    private readonly customCombinedParameterRepository: Repository<CustomCombinedParameter>,
    @InjectRepository(CustomParameter)
    private readonly customParameterRepository: Repository<CustomParameter>,

    @Inject(CONNECTION)
    private readonly dataSource: DataSource,

    @InjectDataSource()
    private readonly datasource: DataSource,
  ) {
    this.customItemRepository = this.dataSource.getRepository(CustomItem);
    this.customTypeRepository = this.dataSource.getRepository(CustomType);
    this.customCombinedParameterRepository = this.dataSource.getRepository(
      CustomCombinedParameter,
    );
    this.customParameterRepository =
      this.dataSource.getRepository(CustomParameter);
  }

  async getAllCustomCharts(param: any) {
    const { page, limit, skip, sort, filter } = param;
    const { otherFilter, is_deleted, search } = filter;
    const whereConditions: any = {
      ...otherFilter,
      is_deleted: is_deleted !== undefined ? is_deleted : false,
    };
    const query = {
      take: limit,
      skip,
      order: sort,
      where: whereConditions,
      relations: ['customItems.combinedParameters.customParameters'],
    };

    const queryBuilder = this.customTypeRepository
      .createQueryBuilder('customType')
      .leftJoinAndSelect('customType.customItems', 'customItem')
      .leftJoinAndSelect('customItem.combinedParameters', 'combinedParameter')
      .leftJoinAndSelect(
        'combinedParameter.customParameters',
        'customParameter',
      )
      .where('customType.is_deleted = :isDeleted', { isDeleted: false });
    if (search) {
      queryBuilder.andWhere('customItem.title ILIKE :search', {
        search: `%${search}%`,
      });
    }
    const [data, totalCount] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    // const [data, totalCount] = await this.customTypeRepository.findAndCount(query);
    return {
      success: true,
      data,
      meta: {
        currentCount: data.length,
        currentPage: page,
        currentLimit: limit,
        totalCount,
      },
    };
  }

  async getCustomChartById(id: string) {
    const customChart = await this.customTypeRepository.findOne({
      where: { id },
      relations: ['customItems.combinedParameters.customParameters'],
    });
    return {
      success: true,
      data: customChart,
    };
  }

  async createCustomChart(params: CustomTypeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newCustomType = await queryRunner.manager
        .getRepository(CustomType)
        .save({
          type: params.type,
          chart_type: params?.chart_type || null,
          is_stacked: params.is_stacked,
          is_horizontal: params.is_horizontal,
          is_metric: params.is_metric,
          is_time_series: params.is_time_series,
        });
      await Promise.all(
        params.custom_items.map(async (custom_item) => {
          const newCustomItem = await queryRunner.manager
            .getRepository(CustomItem)
            .save({
              title: custom_item.title,
              customType: { id: newCustomType.id },
            });
          await Promise.all(
            custom_item.combined_parameters.map(async (combined_parameter) => {
              const newCustomCombinedParameter = await queryRunner.manager
                .getRepository(CustomCombinedParameter)
                .save({
                  sequence: combined_parameter.sequence,
                  customItem: { id: newCustomItem.id },
                });
              await Promise.all(
                combined_parameter.custom_parameters.map(
                  async (custom_parameter) => {
                    await queryRunner.manager
                      .getRepository(CustomParameter)
                      .save({
                        sequence: custom_parameter.sequence,
                        questions: custom_parameter.questions,
                        universal_questions:
                          custom_parameter.universal_questions,
                        macro_function: custom_parameter.macro_function,
                        unit: custom_parameter.unit,
                        legends: custom_parameter.legends,
                        label: custom_parameter.label,
                        custom_item_id: newCustomItem.id,
                        customCombinedParameter: {
                          id: newCustomCombinedParameter.id,
                        },
                      });
                  },
                ),
              );
            }),
          );
        }),
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
    return {
      success: true,
      message: 'Custom chart created successfully',
    };
  }

  async updateCustomChart(id: string, params: CustomTypeUpdateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const customType = await queryRunner.manager
        .getRepository(CustomType)
        .findOne({ where: { id } });
      if (!customType) {
        throw new BadRequestException('Custom chart not found');
      }
      await queryRunner.manager.getRepository(CustomType).update(id, {
        type: params.type,
        chart_type: params.chart_type,
        is_stacked: params.is_stacked,
        is_horizontal: params.is_horizontal,
        is_metric: params.is_metric,
        is_time_series: params.is_time_series,
      });
      await Promise.all(
        params.custom_items.map(async (custom_item) => {
          let customItem;
          if (custom_item.id) {
            customItem = await queryRunner.manager
              .getRepository(CustomItem)
              .findOne({ where: { id: custom_item.id } });
            if (customItem) {
              await queryRunner.manager
                .getRepository(CustomItem)
                .update(customItem.id, {
                  title: custom_item.title,
                  customType: { id: customType.id },
                });
            }
          }
          if (!customItem) {
            customItem = await queryRunner.manager
              .getRepository(CustomItem)
              .save({
                title: custom_item.title,
                customType: { id: customType.id },
              });
          }

          await Promise.all(
            custom_item.combined_parameters.map(async (combined_parameter) => {
              let combinedParameter;
              if (combined_parameter.id) {
                combinedParameter = await queryRunner.manager
                  .getRepository(CustomCombinedParameter)
                  .findOne({ where: { id: combined_parameter.id } });
                if (combinedParameter) {
                  await queryRunner.manager
                    .getRepository(CustomCombinedParameter)
                    .update(combinedParameter.id, {
                      sequence: combined_parameter.sequence,
                      customItem: { id: customItem.id },
                    });
                }
              }
              if (!combinedParameter) {
                combinedParameter = await queryRunner.manager
                  .getRepository(CustomCombinedParameter)
                  .save({
                    sequence: combined_parameter.sequence,
                    customItem: { id: customItem.id },
                  });
              }

              await Promise.all(
                combined_parameter.custom_parameters.map(
                  async (custom_parameter) => {
                    let customParameter;
                    if (custom_parameter.id) {
                      customParameter = await queryRunner.manager
                        .getRepository(CustomParameter)
                        .findOne({ where: { id: custom_parameter.id } });
                      if (customParameter) {
                        await queryRunner.manager
                          .getRepository(CustomParameter)
                          .update(customParameter.id, {
                            sequence: custom_parameter.sequence,
                            questions: custom_parameter.questions,
                            universal_questions:
                              custom_parameter.universal_questions,
                            macro_function: custom_parameter.macro_function,
                            unit: custom_parameter.unit,
                            legends: custom_parameter.legends,
                            label: custom_parameter.label,
                            customCombinedParameter: {
                              id: combinedParameter.id,
                            },
                          });
                      }
                    }
                    if (!customParameter) {
                      await queryRunner.manager
                        .getRepository(CustomParameter)
                        .save({
                          sequence: custom_parameter.sequence,
                          questions: custom_parameter.questions,
                          universal_questions:
                            custom_parameter.universal_questions,
                          macro_function: custom_parameter.macro_function,
                          unit: custom_parameter.unit,
                          legends: custom_parameter.legends,
                          label: custom_parameter.label,
                          custom_item_id: customItem.id,
                          customCombinedParameter: { id: combinedParameter.id },
                        });
                    }
                  },
                ),
              );
            }),
          );
        }),
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
    return {
      success: true,
      message: 'Custom chart updated successfully',
    };
  }

  async deleteCustomChart(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const customType = await queryRunner.manager
        .getRepository(CustomType)
        .findOne({ where: { id } });
      if (!customType) {
        throw new BadRequestException('Custom chart not found');
      }
      await queryRunner.manager.getRepository(CustomType).delete(id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
    return {
      success: true,
      message: 'Custom chart deleted successfully',
    };
  }

  async deleteCustomChartItem(id: string, custom_item_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const customItem = await queryRunner.manager
        .getRepository(CustomItem)
        .findOne({ where: { id: custom_item_id } });
      if (!customItem) {
        throw new BadRequestException('Custom item not found');
      }
      await queryRunner.manager
        .getRepository(CustomItem)
        .delete(custom_item_id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
    return {
      success: true,
      message: 'Custom item deleted successfully',
    };
  }

  async deleteCustomChartCombinedParameter(
    id: string,
    combined_parameter_id: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const combinedParameter = await queryRunner.manager
        .getRepository(CustomCombinedParameter)
        .findOne({ where: { id: combined_parameter_id } });
      if (!combinedParameter) {
        throw new BadRequestException('Combined parameter not found');
      }
      await queryRunner.manager
        .getRepository(CustomCombinedParameter)
        .delete(combined_parameter_id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
    return {
      success: true,
      message: 'Combined parameter deleted successfully',
    };
  }

  async deleteCustomChartCustomParameter(
    id: string,
    custom_parameter_id: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const customParameter = await queryRunner.manager
        .getRepository(CustomParameter)
        .findOne({ where: { id: custom_parameter_id } });
      if (!customParameter) {
        throw new BadRequestException('Custom parameter not found');
      }
      await queryRunner.manager
        .getRepository(CustomParameter)
        .delete(custom_parameter_id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
    return {
      success: true,
      message: 'Custom parameter deleted successfully',
    };
  }
}
