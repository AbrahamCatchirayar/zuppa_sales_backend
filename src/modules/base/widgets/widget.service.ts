import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Department } from '../masters/departments/department.entity';
import { Question } from '../masters/questions/question.entity';
import { StandardIndicator } from '../standards/standard_indicators/standard_indicator.entity';
import { StandardModule } from '../standards/standard_modules/standard_module.entity';
import { GroupQuestionSequences } from '../standards/standard_questions/group_questions/group_question_sequence.entity';
import { CombinedParameter } from './entities/combined_parameter.entity';
import { CustomParameter } from './entities/custom_parameter.entity';
import { Widget } from './entities/widget.entity';
import { WidgetBlock } from './entities/widget_block.entity';
import { WidgetColumn } from './entities/widget_column.entity';
import { WidgetFiltersEntity } from './entities/widget_filter.entity';
import { WidgetItem } from './entities/widget_item.entity';
import { WidgetType } from './entities/widget_type.entity';
import {
  ChartType,
  Type,
  WidgetDto,
  WidgetFilterDto,
  WidgetUpdateDto
} from './widget.dto';

@Injectable()
export class WidgetService {
  private groupQuestionSeqRepo: Repository<GroupQuestionSequences>;

  private masterQuestionRepo: Repository<Question>;

  constructor(
    @InjectRepository(Widget) private widgetRepository: Repository<Widget>,
    @InjectRepository(WidgetItem)
    private widgetItemRepository: Repository<WidgetItem>,
    @InjectRepository(WidgetType)
    private widgetTypeRepository: Repository<WidgetType>,
    @InjectRepository(WidgetBlock)
    private widgetBlockRepository: Repository<WidgetBlock>,
    @InjectRepository(WidgetColumn)
    private widgetColumnRepository: Repository<WidgetColumn>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(WidgetFiltersEntity)
    private widgetFiltersRepository: Repository<WidgetFiltersEntity>,
    @InjectRepository(CombinedParameter)
    private combinedParameterRepository: Repository<CombinedParameter>,
    @InjectRepository(CustomParameter)
    private customParameterRepository: Repository<CustomParameter>,

    @InjectDataSource()
    private readonly datasource: DataSource,
  ) {
    this.widgetRepository = this.datasource.getRepository(Widget);
    this.widgetItemRepository = this.datasource.getRepository(WidgetItem);
    this.widgetTypeRepository = this.datasource.getRepository(WidgetType);
    this.widgetBlockRepository = this.datasource.getRepository(WidgetBlock);
    this.widgetColumnRepository = this.datasource.getRepository(WidgetColumn);
    this.departmentRepository = this.datasource.getRepository(Department);
    this.groupQuestionSeqRepo = this.datasource.getRepository(
      GroupQuestionSequences,
    );
    this.groupQuestionSeqRepo = this.datasource.getRepository(
      GroupQuestionSequences,
    );
    this.masterQuestionRepo = this.datasource.getRepository(Question);
    this.widgetFiltersRepository =
      this.datasource.getRepository(WidgetFiltersEntity);
    this.combinedParameterRepository =
      this.datasource.getRepository(CombinedParameter);
    this.customParameterRepository =
      this.datasource.getRepository(CustomParameter);
    this.widgetFiltersRepository =
      this.datasource.getRepository(WidgetFiltersEntity);
    this.combinedParameterRepository =
      this.datasource.getRepository(CombinedParameter);
    this.customParameterRepository =
      this.datasource.getRepository(CustomParameter);
  }

  async getWidgets(params: WidgetFilterDto) {
    try {
      const { search, page, limit, sort } = params;

      const qb = this.widgetRepository
        .createQueryBuilder('widget')
        .leftJoinAndSelect('widget.module', 'module')
        .leftJoinAndSelect('widget.indicator', 'indicator')
        .leftJoinAndSelect('widget.widget_blocks', 'widget_blocks')
        .leftJoinAndSelect('widget_blocks.widget_columns', 'widget_columns')
        .leftJoinAndSelect('widget_columns.widget_types', 'widget_types')
        .leftJoinAndSelect('widget_types.widget_item', 'widget_item')
        .leftJoinAndSelect('widget_item.filters', 'filters')
        .leftJoinAndSelect('filters.public_question', 'public_question')
        .leftJoinAndSelect(
          'public_question.standard_question_options',
          'standard_question_options',
        )
        .leftJoinAndSelect(
          'widget_item.combined_parameters',
          'combined_parameters',
        )
        .leftJoinAndSelect(
          'combined_parameters.custom_parameter',
          'custom_parameter',
        )
        .orderBy('custom_parameter.createdAt', 'ASC')
        .where('widget.is_deleted = :isDeleted', { isDeleted: false });

        if (search) {
          qb.andWhere('widget.id ILIKE :search', { search: `%${search}%` });
        }

        if (sort && Object.keys(sort).length > 0) {
          const [sortField, sortOrder] = Object.entries(sort)[0];
          qb.orderBy(`widget.${sortField}`, sortOrder as 'ASC' | 'DESC');
        }

        qb.take(Number(limit)).skip((Number(page) - 1) * Number(limit));

        const [widgets, total] = await qb.getManyAndCount();

        widgets.forEach((widget) => {
          widget.widget_blocks = widget.widget_blocks.filter((block) =>
            block.widget_columns && block.widget_columns.length > 0,
          );
        });

      return {
        success: true,
        data: widgets,
        meta: {
          currentCount: widgets.length,
          currentPage: Number(page),
          currentLimit: Number(limit),
          totalCount: total,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createWidget(
    params: WidgetDto,
    module_id: string,
    indicator_id: string,
  ) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const widgets = await Promise.all(
        params.widgets.map(async (widget) => {
          const standardModule = await queryRunner.manager
            .getRepository(StandardModule)
            .findOne({
              where: {
                master_module: { id: module_id },
              },
              relations: ['master_module'],
            });

          if (!standardModule) {
            throw new BadRequestException('Standard module not found');
          }

          const standardIndicator = await queryRunner.manager
            .getRepository(StandardIndicator)
            .findOne({
              where: {
                master_indicator: { id: indicator_id },
              },
              relations: ['master_indicator'],
            });

          if (!standardIndicator) {
            throw new BadRequestException('Standard indicator not found');
          }

          const widgetIndicator = await queryRunner.manager
            .getRepository(Widget)
            .findOne({
              where: {
                indicator: { id: indicator_id },
              },
            });

          if (widgetIndicator) {
            await Promise.all(
              params.widgets.map(async (newWidget) => {
                const updatedWidgetIndicator = await queryRunner.manager
                  .getRepository(Widget)
                  .update(widgetIndicator.id, {
                    number_of_blocks:
                      widgetIndicator.number_of_blocks +
                      newWidget.number_of_blocks.length,
                  });

                // Create blocks and store their IDs for later use
                const createdBlocks = await Promise.all(
                  newWidget.number_of_blocks.map(async (block, blockIndex) => {
                    const newBlock = await queryRunner.manager
                      .getRepository(WidgetBlock)
                      .save({
                        number_of_columns: block.number_of_columns.length,
                        sequence:
                          newWidget.number_of_blocks.length + blockIndex + 1,
                        widget: { id: widgetIndicator.id },
                      });
                    return { block: newBlock, originalBlock: block };
                  }),
                );

                if (!updatedWidgetIndicator) {
                  throw new BadRequestException('Widget indicator not found');
                }

                // Process columns for each created block
                await Promise.all(
                  createdBlocks.map(
                    async ({ block: newBlock, originalBlock }) => {
                      await Promise.all(
                        originalBlock.number_of_columns.map(
                          async (column, columnIndex) => {
                            const newColumn = await queryRunner.manager
                              .getRepository(WidgetColumn)
                              .save({
                                sequence:
                                  (newBlock?.widget_columns?.length || 0) +
                                  columnIndex +
                                  1,
                                widget_block: { id: newBlock?.id },
                              });

                            const newWidgetType = await queryRunner.manager
                              .getRepository(WidgetType)
                              .save({
                                type: column.widget_type,
                                chart_type: column.chart_type,
                                widget_column: { id: newColumn.id },
                                widget: { id: widgetIndicator.id },
                                is_stacked: column.isStacked,
                                is_horizontal: column.isHorizontal,
                                is_metric: column.isMetric,
                                is_time_series: column.isTimeSeries,
                                latest_data: column.latestData,
                              });

                            await Promise.all(
                              column.widget_items.map(
                                async (widget_item, widget_item_index) => {
                                  const newWidgetItem =
                                    await queryRunner.manager
                                      .getRepository(WidgetItem)
                                      .save({
                                        title: widget_item.title,
                                        filter: widget_item.filter,
                                        is_homepage_widget:
                                          widget_item.isHomePageWidget,
                                        widget: { id: widgetIndicator.id },
                                        widget_type: { id: newWidgetType.id },
                                        sequence: widget_item_index + 1,
                                      });

                                  if (newWidgetItem.filter === true) {
                                    await Promise.all(
                                      widget_item.filters.map(
                                        async (filter, filter_index) => {
                                          await queryRunner.manager
                                            .getRepository(WidgetFiltersEntity)
                                            .save({
                                              widget_item_id: {
                                                id: newWidgetItem.id,
                                              },
                                              public_question: {
                                                id: filter.public_question_id,
                                              },
                                              is_option: filter.is_option,
                                              universal_question_id:
                                                filter.universal_question_id,
                                              sequence: filter_index + 1,
                                            });
                                        },
                                      ),
                                    );
                                  }

                                  await Promise.all(
                                    widget_item.combined_parameters.map(
                                      async (combined_parameter) => {
                                        const newCombinedParameter =
                                          await queryRunner.manager
                                            .getRepository(CombinedParameter)
                                            .save({
                                              name: combined_parameter.name,
                                              widget_item: {
                                                id: newWidgetItem.id,
                                              },
                                            });

                                        await Promise.all(
                                          combined_parameter.custom_parameters.map(
                                            async (
                                              custom_parameter,
                                              custom_parameter_index,
                                            ) => {
                                              const newCustomParameter =
                                                await queryRunner.manager
                                                  .getRepository(
                                                    CustomParameter,
                                                  )
                                                  .save({
                                                    name: custom_parameter.name,
                                                    questions:
                                                      custom_parameter.questions,
                                                    macro_function:
                                                      custom_parameter.macro_function,
                                                    answer: null,
                                                    unit: custom_parameter.unit,
                                                    legends:
                                                      custom_parameter.legends,
                                                    label:
                                                      custom_parameter.label,
                                                    combined_parameter:
                                                      newCombinedParameter,
                                                    widget_id:
                                                      widgetIndicator.id,
                                                    sequence:
                                                      custom_parameter_index +
                                                      1,
                                                  });
                                            },
                                          ),
                                        );
                                      },
                                    ),
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
                );
              }),
            );
          } else {
            const newWidget = await queryRunner.manager
              .getRepository(Widget)
              .save({
                module: standardModule.master_module,
                indicator: standardIndicator.master_indicator,
                sequence: widget.sequence,
                number_of_blocks: widget.number_of_blocks.length,
                department_id: null,
              });

            await Promise.all(
              widget.number_of_blocks.map(async (block, blockIndex) => {
                if (
                  !block.number_of_columns ||
                  !block.number_of_columns.length
                ) {
                  throw new BadRequestException(
                    'Number of columns is required',
                  );
                }

                const newWidgetBlock = await queryRunner.manager
                  .getRepository(WidgetBlock)
                  .save({
                    number_of_columns: block.number_of_columns.length,
                    sequence: blockIndex + 1,
                    widget: newWidget,
                  });

                await Promise.all(
                  block.number_of_columns.map(async (column, columnIndex) => {
                    if (!column) {
                      throw new BadRequestException('Column data is required');
                    }

                    const newWidgetColumn = await queryRunner.manager
                      .getRepository(WidgetColumn)
                      .save({
                        sequence: columnIndex + 1,
                        widget_block: newWidgetBlock,
                      });

                    if (!column.widget_type) {
                      throw new BadRequestException('Widget type is required');
                    }

                    if (Object.values(Type).includes(column.widget_type)) {
                      if (column.widget_type === Type.CHART) {
                        if (
                          !column.chart_type ||
                          !Object.values(ChartType).includes(column.chart_type)
                        ) {
                          throw new BadRequestException(
                            'Chart type is required when widget is chart',
                          );
                        }
                      }

                      if (!column.widget_items) {
                        throw new BadRequestException(
                          'Widget items are required',
                        );
                      }

                      const widgetType = await queryRunner.manager
                        .getRepository(WidgetType)
                        .save({
                          type: column.widget_type,
                          chart_type:
                            column.widget_type === Type.CHART
                              ? column.chart_type
                              : null,
                          widget_column: newWidgetColumn,
                          widget: newWidget,
                          is_stacked: column.isStacked,
                          is_horizontal: column.isHorizontal,
                          is_metric: column.isMetric,
                          is_time_series: column.isTimeSeries,
                          latest_data: column.latestData,
                        });

                      const widgetItem = await Promise.all(
                        column.widget_items.map(
                          async (widget_item, widget_item_index) => {
                            const newWidgetItem = await queryRunner.manager
                              .getRepository(WidgetItem)
                              .save({
                                title: widget_item.title,
                                filter: widget_item.filter,
                                is_homepage_widget:
                                  widget_item.isHomePageWidget,
                                widget: newWidget,
                                widget_type: widgetType,
                                sequence: widget_item_index + 1,
                              });
                            if (newWidgetItem.filter === true) {
                              await Promise.all(
                                widget_item.filters.map(
                                  async (filter, filter_index) => {
                                    await queryRunner.manager
                                      .getRepository(WidgetFiltersEntity)
                                      .save({
                                        widget_item_id: {
                                          id: newWidgetItem.id,
                                        },
                                        public_question: {
                                          id: filter.public_question_id,
                                        },
                                        universal_question_id:
                                          filter.universal_question_id,
                                        is_option: filter.is_option,
                                        sequence: filter_index + 1,
                                      });
                                  },
                                ),
                              );
                            }
                            return newWidgetItem;
                          },
                        ),
                      );

                      await Promise.all(
                        column.widget_items.map(async (widget_item) => {
                          return await Promise.all(
                            widget_item.combined_parameters.map(
                              async (
                                combined_parameter,
                                combined_parameter_index,
                              ) => {
                                const combinedParameter =
                                  await queryRunner.manager
                                    .getRepository(CombinedParameter)
                                    .save({
                                      name: combined_parameter.name,
                                      widget_item: widgetItem[0], // Access first widget item since it's an array
                                      sequence: combined_parameter_index + 1,
                                    });

                                await Promise.all(
                                  combined_parameter.custom_parameters.map(
                                    async (
                                      custom_parameter,
                                      custom_parameter_index,
                                    ) => {
                                      const customParameter =
                                        await queryRunner.manager
                                          .getRepository(CustomParameter)
                                          .save({
                                            name: custom_parameter.name,
                                            questions:
                                              custom_parameter.questions,
                                            macro_function:
                                              custom_parameter.macro_function,
                                            unit: custom_parameter.unit,
                                            legends: custom_parameter.legends,
                                            label: custom_parameter.label,
                                            combined_parameter:
                                              combinedParameter,
                                            universal_questions:
                                              custom_parameter.universal_questions,
                                            widget_id: newWidget.id,
                                            sequence:
                                              custom_parameter_index + 1,
                                          });
                                    },
                                  ),
                                );
                              },
                            ),
                          );
                        }),
                      );
                    } else {
                      throw new BadRequestException('Invalid widget type');
                    }
                  }),
                );
              }),
            );
          }
          return widget;
        }),
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Widget created successfully',
        // data: widgets,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  // async getWidgetsByModuleId(module_id: string, params: WidgetFilterDto) {
  //   try {
  //     const qb = this.widgetRepository
  //       .createQueryBuilder('widget')
  //       .leftJoinAndSelect('widget.module', 'module')
  //       .leftJoinAndSelect('widget.indicator', 'indicator')
  //       .leftJoinAndSelect('widget.widget_blocks', 'widget_blocks')
  //       .leftJoinAndSelect('widget_blocks.widget_columns', 'widget_columns')
  //       .leftJoinAndSelect('widget_columns.widget_types', 'widget_types')
  //       .leftJoinAndSelect(
  //         'widget_types.widget_item',
  //         'widget_item',
  //         'widget_item.is_homepage_widget = :isHomepageWidget',
  //         { isHomepageWidget: false },
  //       )
  //       .leftJoinAndSelect('widget_item.filters', 'filters')
  //       .leftJoinAndSelect('filters.public_question', 'public_question')
  //       .leftJoinAndSelect(
  //         'public_question.standard_question_options',
  //         'standard_question_options',
  //       )
  //       .leftJoinAndSelect(
  //         'widget_item.combined_parameters',
  //         'combined_parameters',
  //       )
  //       .leftJoinAndSelect(
  //         'combined_parameters.custom_parameter',
  //         'custom_parameter',
  //       )
  //       .orderBy('custom_parameter.createdAt', 'ASC')
  //       .where('widget.is_deleted = :isDeleted', { isDeleted: false })
  //       .andWhere('widget.module_id = :moduleId', { moduleId: module_id });

  //     const widgets = await qb.getMany();
  //     // const widgets = await this.widgetRepository.find({
  //     //   where: {
  //     //     module: { id: module_id },
  //     //   },
  //     //   relations: [
  //     //     'module',
  //     //     'indicator',
  //     //     // 'widget_blocks',
  //     //     // 'widget_blocks.widget_columns',
  //     //     // 'widget_blocks.widget_columns.widget_types',
  //     //     // 'widget_blocks.widget_columns.widget_types.widget_item',
  //     //     'widget_blocks.widget_columns.widget_types.widget_item.filters.public_question',
  //     //     // 'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters',
  //     //     'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters.custom_parameter',
  //     //   ],
  //     // });

  //     if (!widgets) {
  //       throw new BadRequestException('Widgets not found');
  //     }

  //     // 👇 prefetch all group question sequences once
  //     const groupSeqs = await this.groupQuestionSeqRepo.find({
  //       relations: ['group_question'],
  //     });

  //     // 👇 collect all universal_question_ids to query master_question in one go
  //     const allUniversalIds: string[] = [];
  //     for (const g of groupSeqs) {
  //       if (g.universal_question_id) {
  //         allUniversalIds.push(g.universal_question_id);
  //       }
  //     }

  //     // 👇 preload master questions
  //     const masterQuestions = await this.masterQuestionRepo.find({
  //       where: allUniversalIds.map((uid) => ({ universal_question_id: uid })),
  //     });

  //     const masterMap = new Map(
  //       masterQuestions.map((mq) => [mq.universal_question_id, mq.title]),
  //     );

  //     // Group widgets by module and indicators
  //     const groupedWidgets = widgets.reduce(
  //       (acc, widget) => {
  //         const moduleId = widget.module.id;
  //         const moduleData = acc[moduleId] || {
  //           id: widget.module.id,
  //           name: widget.module.name,
  //           description: widget.module.description,
  //           indicators: [],
  //         };

  //         for (const block of widget.widget_blocks || []) {
  //           for (const column of block.widget_columns || []) {
  //             for (const widgetType of column.widget_types || []) {
  //               // TABLE TYPE CHECK
  //               if (widgetType.type === 'table') {
  //                 for (const widgetItem of widgetType.widget_item || []) {
  //                   for (const comb of widgetItem.combined_parameters || []) {
  //                     for (const custom of comb.custom_parameter || []) {
  //                       const universalQIds =
  //                         custom.questions?.flatMap((qId) => {
  //                           const seqs = groupSeqs.filter(
  //                             (g) => g.group_question?.id === qId,
  //                           );
  //                           return seqs.map((s) => s.universal_question_id);
  //                         }) || [];

  //                       // Map IDs -> titles from master_question
  //                       const questionTexts = universalQIds.map(
  //                         (uid) => masterMap.get(uid) || uid,
  //                       );

  //                       custom['universal_questions'] = universalQIds;
  //                       custom['question_texts'] = questionTexts;
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }

  //         moduleData.indicators.push({
  //           id: widget.indicator.id,
  //           name: widget.indicator.name,
  //           description: widget.indicator.description,
  //           sequence: widget.sequence || 0,
  //           number_of_blocks: widget.number_of_blocks,
  //           widget_blocks: widget.widget_blocks,
  //         });

  //         acc[moduleId] = moduleData;
  //         return acc;
  //       },
  //       {} as Record<string, any>,
  //     );

  //     // Sort indicators by sequence number for each module
  //     Object.values(groupedWidgets).forEach((moduleData: any) => {
  //       if (moduleData.indicators && moduleData.indicators.length > 0) {
  //         // If all sequences are 0, generate new sequences
  //         const allZeroSequences = moduleData.indicators.every(
  //           (ind: any) => ind.sequence === 0,
  //         );

  //         if (allZeroSequences) {
  //           moduleData.indicators.forEach((ind: any, index: number) => {
  //             ind.sequence = index + 1;
  //           });
  //         } else {
  //           // Sort by existing sequence values
  //           moduleData.indicators.sort(
  //             (a: any, b: any) => a.sequence - b.sequence,
  //           );
  //         }
  //       }
  //     });

  //     return {
  //       success: true,
  //       data: groupedWidgets,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error);
  //   }
  // }

  async getWidgetsByModuleId(module_id: string, params: WidgetFilterDto) {
    try {
      const qb = this.widgetRepository
        .createQueryBuilder('widget')
        .leftJoinAndSelect('widget.module', 'module')
        .leftJoinAndSelect('widget.indicator', 'indicator')
        .leftJoinAndSelect('widget.widget_blocks', 'widget_blocks')
        .leftJoinAndSelect('widget_blocks.widget_columns', 'widget_columns')
        .leftJoinAndSelect('widget_columns.widget_types', 'widget_types')
        .leftJoinAndSelect(
          'widget_types.widget_item',
          'widget_item',
          'widget_item.is_homepage_widget = :isHomepageWidget',
          { isHomepageWidget: false },
        )
        .leftJoinAndSelect('widget_item.filters', 'filters')
        .leftJoinAndSelect('filters.public_question', 'public_question')
        .leftJoinAndSelect(
          'public_question.standard_question_options',
          'standard_question_options',
        )
        .leftJoinAndSelect(
          'widget_item.combined_parameters',
          'combined_parameters',
        )
        .leftJoinAndSelect(
          'combined_parameters.custom_parameter',
          'custom_parameter',
        )
        .orderBy('custom_parameter.createdAt', 'ASC')
        .where('widget.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('widget.module_id = :moduleId', { moduleId: module_id });

      const widgets = await qb.getMany();

      if (!widgets) {
        throw new BadRequestException('Widgets not found');
      }

      // 🧹 Clean up: remove widget_blocks/columns/types without valid widget_items
      for (const widget of widgets) {
        widget.widget_blocks = widget.widget_blocks
          ?.map((block) => {
            block.widget_columns = block.widget_columns
              ?.map((column) => {
                column.widget_types = column.widget_types
                  ?.map((type) => {
                    // Keep only widget_types that have at least one widget_item
                    if (type.widget_item?.length > 0) return type;
                    return null;
                  })
                  .filter((t) => t !== null);
                return column.widget_types?.length > 0 ? column : null;
              })
              .filter((c) => c !== null);
            return block.widget_columns?.length > 0 ? block : null;
          })
          .filter((b) => b !== null);
      }

      // 👇 prefetch all group question sequences once
      const groupSeqs = await this.groupQuestionSeqRepo.find({
        relations: ['group_question'],
      });

      // 👇 collect all universal_question_ids to query master_question in one go
      const allUniversalIds: string[] = [];
      for (const g of groupSeqs) {
        if (g.universal_question_id) {
          allUniversalIds.push(g.universal_question_id);
        }
      }

      // 👇 preload master questions
      const masterQuestions = await this.masterQuestionRepo.find({
        where: allUniversalIds.map((uid) => ({ universal_question_id: uid })),
      });

      const masterMap = new Map(
        masterQuestions.map((mq) => [mq.universal_question_id, mq.title]),
      );

      // Group widgets by module and indicators
      const groupedWidgets = widgets.reduce(
        (acc, widget) => {
          const moduleId = widget.module.id;
          const moduleData = acc[moduleId] || {
            id: widget.module.id,
            name: widget.module.name,
            description: widget.module.description,
            indicators: [],
          };

          for (const block of widget.widget_blocks || []) {
            for (const column of block.widget_columns || []) {
              for (const widgetType of column.widget_types || []) {
                // TABLE TYPE CHECK
                if (widgetType.type === 'table') {
                  for (const widgetItem of widgetType.widget_item || []) {
                    for (const comb of widgetItem.combined_parameters || []) {
                      for (const custom of comb.custom_parameter || []) {
                        const universalQIds =
                          custom.questions?.flatMap((qId) => {
                            const seqs = groupSeqs.filter(
                              (g) => g.group_question?.id === qId,
                            );
                            return seqs.map((s) => s.universal_question_id);
                          }) || [];

                        // Map IDs -> titles from master_question
                        const questionTexts = universalQIds.map(
                          (uid) => masterMap.get(uid) || uid,
                        );

                        custom.universal_questions = universalQIds;
                        custom['question_texts'] = questionTexts;
                      }
                    }
                  }
                }
              }
            }
          }

          // Only push indicators that still have widget_blocks after cleanup
          if (widget.widget_blocks && widget.widget_blocks.length > 0) {
            moduleData.indicators.push({
              id: widget.indicator.id,
              name: widget.indicator.name,
              description: widget.indicator.description,
              sequence: widget.sequence || 0,
              number_of_blocks: widget.number_of_blocks,
              widget_blocks: widget.widget_blocks,
            });
          }

          acc[moduleId] = moduleData;
          return acc;
        },
        {} as Record<string, any>,
      );

      // Sort indicators by sequence number for each module
      Object.values(groupedWidgets).forEach((moduleData: any) => {
        if (moduleData.indicators && moduleData.indicators.length > 0) {
          const allZeroSequences = moduleData.indicators.every(
            (ind: any) => ind.sequence === 0,
          );

          if (allZeroSequences) {
            moduleData.indicators.forEach((ind: any, index: number) => {
              ind.sequence = index + 1;
            });
          } else {
            moduleData.indicators.sort(
              (a: any, b: any) => a.sequence - b.sequence,
            );
          }
        }
      });

      return {
        success: true,
        data: groupedWidgets,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getWidgetById(module_id: string, widget_id: string) {
    try {
      const qb = this.widgetRepository
        .createQueryBuilder('widget')
        .leftJoinAndSelect('widget.module', 'module')
        .leftJoinAndSelect('widget.indicator', 'indicator')
        .leftJoinAndSelect('widget.widget_blocks', 'widget_blocks')
        .leftJoinAndSelect('widget_blocks.widget_columns', 'widget_columns')
        .leftJoinAndSelect('widget_columns.widget_types', 'widget_types')
        .leftJoinAndSelect('widget_types.widget_item', 'widget_item')
        .leftJoinAndSelect('widget_item.filters', 'filters')
        .leftJoinAndSelect('filters.public_question', 'public_question')
        .leftJoinAndSelect(
          'public_question.standard_question_options',
          'standard_question_options',
        )
        .leftJoinAndSelect(
          'widget_item.combined_parameters',
          'combined_parameters',
        )
        .leftJoinAndSelect(
          'combined_parameters.custom_parameter',
          'custom_parameter',
        )
        .orderBy('custom_parameter.createdAt', 'ASC')
        .where('widget.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('widget.id = :widgetId', { widgetId: widget_id })
        .andWhere('widget.module_id = :moduleId', { moduleId: module_id });
      const widget = await qb.getOne();
      // const widget = await this.widgetRepository.findOne({
      //   where: { id: widget_id, module: { id: module_id } },
      //   relations: [
      //     'module',
      //     'indicator',
      //     // 'widget_blocks',
      //     // 'widget_blocks.widget_columns',
      //     // 'widget_blocks.widget_columns.widget_types',
      //     // 'widget_blocks.widget_columns.widget_types.widget_item',
      //     'widget_blocks.widget_columns.widget_types.widget_item.filters.public_question',
      //     // 'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters',
      //     'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters.custom_parameter',
      //   ],
      // });

      if (!widget) {
        throw new BadRequestException('Widget not found');
      }

      return {
        success: true,
        data: widget,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateWidget(
    widget_id: string,
    module_id: string,
    indicator_id: string,
    params: WidgetUpdateDto,
  ) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const standardModule = await queryRunner.manager
        .getRepository(StandardModule)
        .findOne({
          where: {
            master_module: { id: module_id },
          },
          relations: ['master_module'],
        });

      if (!standardModule) {
        throw new BadRequestException('Standard module not found');
      }

      const standardIndicator = await queryRunner.manager
        .getRepository(StandardIndicator)
        .findOne({
          where: {
            master_indicator: { id: indicator_id },
          },
          relations: ['master_indicator'],
        });

      if (!standardIndicator) {
        throw new BadRequestException('Standard indicator not found');
      }

      const widget = await queryRunner.manager.getRepository(Widget).findOne({
        where: {
          id: widget_id,
          module: { id: module_id },
          indicator: { id: indicator_id },
        },
        relations: [
          'module',
          'indicator',
          'widget_blocks',
          'widget_blocks.widget_columns',
          'widget_blocks.widget_columns.widget_types',
          'widget_blocks.widget_columns.widget_types.widget_item',
          'widget_blocks.widget_columns.widget_types.widget_item.filters',
          'widget_blocks.widget_columns.widget_types.widget_item.filters.public_question.standard_question_options',
          'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters',
          'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters.custom_parameter',
        ],
      });

      if (!widget) {
        throw new BadRequestException('Widget not found');
      }

      // Update widget basic fields
      await queryRunner.manager.getRepository(Widget).update(widget.id, {
        sequence: params.sequence,
        number_of_blocks: params.number_of_blocks.length,
        department_id: params.department_id
          ? { id: params.department_id }
          : widget.department_id
            ? widget.department_id
            : null,
      });

      // Process widget blocks
      await Promise.all(
        params.number_of_blocks.map(async (block) => {
          let widgetBlock;

          // Check if this is an existing block (has valid UUID ID) or new block (no ID)
          if (block?.id && block.id.trim() !== '') {
            // Try to find existing block
            widgetBlock = await queryRunner.manager
              .getRepository(WidgetBlock)
              .findOne({
                where: { id: block.id },
              });

            if (widgetBlock) {
              // Update existing block
              await queryRunner.manager
                .getRepository(WidgetBlock)
                .update(widgetBlock.id, {
                  number_of_columns: block.number_of_columns.length,
                  sequence: block.sequence,
                });
            }
          }

          // If block doesn't exist or is new (no ID), create it
          if (!widgetBlock) {
            // Get max sequence from existing blocks
            const maxSequence = await queryRunner.manager
              .getRepository(WidgetBlock)
              .createQueryBuilder('wb')
              .select('MAX(wb.sequence)', 'maxSeq')
              .where('wb.widget.id = :widgetId', { widgetId: widget.id })
              .getRawOne();

            const newSequence = (maxSequence?.maxSeq || 0) + 1;

            widgetBlock = await queryRunner.manager
              .getRepository(WidgetBlock)
              .save({
                id: block?.id && block.id.trim() !== '' ? block.id : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                number_of_columns: block.number_of_columns.length,
                sequence: newSequence,
                widget: { id: widget.id },
              });
          }

          // Process widget columns
          await Promise.all(
            block.number_of_columns.map(async (column, columnIndex) => {
              let widgetColumn;

              // Check if this is an existing column (has valid UUID ID) or new column (no ID)
              if (column?.id && column.id.trim() !== '') {
                // Try to find existing column
                widgetColumn = await queryRunner.manager
                  .getRepository(WidgetColumn)
                  .findOne({
                    where: { id: column.id },
                  });

                if (widgetColumn) {
                  // Update existing column - no sequence property in DTO
                  await queryRunner.manager
                    .getRepository(WidgetColumn)
                    .update(widgetColumn.id, {
                      sequence: column.sequence,
                      // Keep existing sequence since it's not in the update DTO
                    });
                }
              }

              // If column doesn't exist or is new (no ID), create it
              if (!widgetColumn) {
                // Create new column
                widgetColumn = await queryRunner.manager
                  .getRepository(WidgetColumn)
                  .save({
                    id:
                      column?.id && column.id.trim() !== ''
                        ? column.id
                        : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                    sequence: columnIndex + 1, // Default sequence for new columns
                    widget_block: { id: widgetBlock.id },
                  });
              }

              // Process widget types using the same pattern as createWidget
              if (column.type_id) {
                // Based on the DTO, use type_id property
                const widgetTypeId = column.type_id;
                const widgetTypeValue = column.widget_type;

                let existingWidgetType;

                // Check if this is an existing widget type (has type_id) or new one (no type_id)
                if (widgetTypeId) {
                  // Try to find existing widget type
                  existingWidgetType = await queryRunner.manager
                    .getRepository(WidgetType)
                    .findOne({
                      where: { id: widgetTypeId },
                    });

                  if (existingWidgetType) {
                    // Update existing widget type using the same fields as createWidget
                    await queryRunner.manager
                      .getRepository(WidgetType)
                      .update(existingWidgetType.id, {
                        type: widgetTypeValue,
                        chart_type: column.chart_type,
                        is_stacked: column.isStacked,
                        is_horizontal: column.isHorizontal,
                        is_metric: column.isMetric,
                        is_time_series: column.isTimeSeries,
                        latest_data: column.latestData,
                      });
                  }
                }

                // If widget type doesn't exist or is new (no type_id), create it
                if (!existingWidgetType) {
                  // Create new widget type using the same pattern as createWidget
                  existingWidgetType = await queryRunner.manager
                    .getRepository(WidgetType)
                    .save({
                      id: widgetTypeId, // This will be undefined for new types, so TypeORM will generate one
                      type: widgetTypeValue,
                      chart_type: column.chart_type,
                      is_stacked: column.isStacked,
                      is_horizontal: column.isHorizontal,
                      is_metric: column.isMetric,
                      is_time_series: column.isTimeSeries,
                      latest_data: column.latestData,
                      widget_column: { id: widgetColumn.id },
                      widget: { id: widget.id },
                    });
                }

                // Process widget items under this widget type
                if (column.widget_items) {
                  await Promise.all(
                    column.widget_items.map(async (widget_item) => {
                      let existingWidgetItem;

                      // Check if this is an existing widget item (has valid UUID ID) or new one (no ID)
                      if (widget_item?.id && widget_item.id.trim() !== '') {
                        // Try to find existing widget item
                        existingWidgetItem = await queryRunner.manager
                          .getRepository(WidgetItem)
                          .findOne({
                            where: { id: widget_item.id },
                          });

                        if (existingWidgetItem) {
                          // Update existing widget item
                          await queryRunner.manager
                            .getRepository(WidgetItem)
                            .update(existingWidgetItem.id, {
                              title: widget_item.title,
                              widget_type: { id: existingWidgetType.id },
                              widget: { id: widget.id },
                              is_homepage_widget: widget_item.isHomePageWidget,
                            });
                        }
                      }

                      // If widget item doesn't exist or is new (no ID), create it
                      if (!existingWidgetItem) {
                        // Create new widget item
                        existingWidgetItem = await queryRunner.manager
                          .getRepository(WidgetItem)
                          .save({
                            id:
                              widget_item?.id && widget_item.id.trim() !== ''
                                ? widget_item.id
                                : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                            title: widget_item.title,
                            filter: false, // Default value for new items
                            is_homepage_widget: widget_item.isHomePageWidget,
                            widget: { id: widget.id },
                            widget_type: { id: existingWidgetType.id },
                          });
                      }

                      // Process filters
                      if (widget_item.filters) {
                        await Promise.all(
                          widget_item.filters.map(
                            async (filter, filter_index) => {
                              // Find existing filter by widget_item_id and public_question_id
                              const existingFilter = await queryRunner.manager
                                .getRepository(WidgetFiltersEntity)
                                .findOne({
                                  where: {
                                    widget_item_id: {
                                      id: existingWidgetItem.id,
                                    },
                                    public_question: {
                                      id: filter.public_question_id,
                                    },
                                  },
                                });

                              if (existingFilter) {
                                // Update existing filter
                                await queryRunner.manager
                                  .getRepository(WidgetFiltersEntity)
                                  .update(existingFilter.id, {
                                    public_question: {
                                      id: filter.public_question_id,
                                    },
                                    universal_question_id:
                                      filter.universal_question_id,
                                    is_option: filter.is_option,
                                    sequence: filter.sequence,
                                  });
                              } else {
                                // Create new filter with generated ID
                                await queryRunner.manager
                                  .getRepository(WidgetFiltersEntity)
                                  .save({
                                    public_question: {
                                      id: filter.public_question_id,
                                    },
                                    universal_question_id:
                                      filter.universal_question_id,
                                    is_option: filter.is_option,
                                    widget_item_id: {
                                      id: existingWidgetItem.id,
                                    },
                                    sequence: filter_index + 1,
                                  });
                              }
                            },
                          ),
                        );
                      }

                      // Process combined parameters
                      if (widget_item.combined_parameters) {
                        await Promise.all(
                          widget_item.combined_parameters.map(
                            async (combined_parameter) => {
                              let existingCombinedParameter;

                              // Check if this is an existing combined parameter (has valid UUID ID) or new one (no ID)
                              if (
                                combined_parameter?.id &&
                                combined_parameter.id.trim() !== ''
                              ) {
                                // Try to find existing combined parameter
                                existingCombinedParameter =
                                  await queryRunner.manager
                                    .getRepository(CombinedParameter)
                                    .findOne({
                                      where: { id: combined_parameter.id },
                                    });

                                if (existingCombinedParameter) {
                                  // Update existing combined parameter
                                  await queryRunner.manager
                                    .getRepository(CombinedParameter)
                                    .update(existingCombinedParameter.id, {
                                      name: combined_parameter.name,
                                    });
                                }
                              }

                              // If combined parameter doesn't exist or is new (no ID), create it
                              if (!existingCombinedParameter) {
                                // Create new combined parameter
                                existingCombinedParameter =
                                  await queryRunner.manager
                                    .getRepository(CombinedParameter)
                                    .save({
                                      id:
                                        combined_parameter?.id &&
                                        combined_parameter.id.trim() !== ''
                                          ? combined_parameter.id
                                          : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                                      name: combined_parameter.name,
                                      widget_item: {
                                        id: existingWidgetItem.id,
                                      },
                                    });
                              }

                              // Process custom parameters
                              if (combined_parameter.custom_parameters) {
                                await Promise.all(
                                  combined_parameter.custom_parameters.map(
                                    async (
                                      custom_parameter,
                                      custom_parameter_index,
                                    ) => {
                                      let existingCustomParameter;

                                      // Check if this is an existing custom parameter (has valid UUID ID) or new one (no ID)
                                      if (
                                        custom_parameter?.id &&
                                        custom_parameter.id.trim() !== ''
                                      ) {
                                        // Try to find existing custom parameter
                                        existingCustomParameter =
                                          await queryRunner.manager
                                            .getRepository(CustomParameter)
                                            .findOne({
                                              where: {
                                                id: custom_parameter.id,
                                              },
                                            });
                                        if (existingCustomParameter) {
                                          // Update existing custom parameter
                                          await queryRunner.manager
                                            .getRepository(CustomParameter)
                                            .update(
                                              existingCustomParameter.id,
                                              {
                                                name: custom_parameter.name,
                                                questions:
                                                  custom_parameter.question_list,
                                                macro_function:
                                                  custom_parameter.macro_function,
                                                unit: custom_parameter.unit,
                                                legends:
                                                  custom_parameter.legends,
                                                label: custom_parameter.label,
                                              },
                                            );
                                        }
                                      }

                                      // If custom parameter doesn't exist or is new (no ID), create it
                                      if (!existingCustomParameter) {
                                        // Create new custom parameter
                                        await queryRunner.manager
                                          .getRepository(CustomParameter)
                                          .save({
                                            id:
                                              custom_parameter?.id &&
                                              custom_parameter.id.trim() !== ''
                                                ? custom_parameter.id
                                                : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                                            name: custom_parameter.name,
                                            questions:
                                              custom_parameter.question_list,
                                            macro_function:
                                              custom_parameter.macro_function,
                                            unit: custom_parameter.unit,
                                            legends: custom_parameter.legends,
                                            label: custom_parameter.label,
                                            combined_parameter: {
                                              id: existingCombinedParameter.id,
                                            },
                                            widget_id: widget.id,
                                            sequence:
                                              custom_parameter_index + 1,
                                          });
                                      }
                                    },
                                  ),
                                );
                              }
                            },
                          ),
                        );
                      }
                    }),
                  );
                }
              } else {
                // Create new widget type for the column
                const newWidgetType = await queryRunner.manager
                  .getRepository(WidgetType)
                  .save({
                    type: column.widget_type,
                    chart_type: column.chart_type,
                    widget_column: { id: widgetColumn.id },
                    is_stacked: column.isStacked,
                    is_horizontal: column.isHorizontal,
                    is_metric: column.isMetric,
                    is_time_series: column.isTimeSeries,
                    latest_data: column.latestData,
                  });

                // Create new widget items for the new widget type
                await Promise.all(
                  column.widget_items.map(async (widget_item) => {
                    const newWidgetItem = await queryRunner.manager
                      .getRepository(WidgetItem)
                      .save({
                        title: widget_item.title,
                        is_homepage_widget: widget_item.isHomePageWidget,
                        widget_type: { id: newWidgetType.id },
                      });

                    if (widget_item.filter === true) {
                      await Promise.all(
                        widget_item.filters.map(
                          async (filter, filter_index) => {
                            await queryRunner.manager
                              .getRepository(WidgetFiltersEntity)
                              .save({
                                widget_item_id: { id: newWidgetItem.id },
                                public_question: {
                                  id: filter.public_question_id,
                                },
                                universal_question_id:
                                  filter.universal_question_id,
                                is_option: filter.is_option,
                                sequence: filter_index + 1,
                              });
                          },
                        ),
                      );
                    }

                    // Create combined parameters for the new widget item
                    await Promise.all(
                      widget_item.combined_parameters.map(
                        async (
                          combined_parameter,
                          combined_parameter_index,
                        ) => {
                          const newCombinedParameter = await queryRunner.manager
                            .getRepository(CombinedParameter)
                            .save({
                              name: combined_parameter.name,
                              widget_item: { id: newWidgetItem.id },
                              sequence: combined_parameter_index + 1,
                            });

                          // Create custom parameters for the new combined parameter
                          await Promise.all(
                            combined_parameter.custom_parameters.map(
                              async (
                                custom_parameter,
                                custom_parameter_index,
                              ) => {
                                await queryRunner.manager
                                  .getRepository(CustomParameter)
                                  .save({
                                    name: custom_parameter.name,
                                    questions: custom_parameter.question_list,
                                    macro_function:
                                      custom_parameter.macro_function,
                                    unit: custom_parameter.unit,
                                    legends: custom_parameter.legends,
                                    label: custom_parameter.label,
                                    combined_parameter: {
                                      id: newCombinedParameter.id,
                                    },
                                    widget_id: widget.id,
                                    sequence: custom_parameter_index + 1,
                                  });
                              },
                            ),
                          );
                        },
                      ),
                    );
                  }),
                );
              }
            }),
          );
        }),
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Widget updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteWidget(widget_id: string) {
    const widget = await this.widgetRepository.findOne({
      where: { id: widget_id },
    });
    if (!widget) {
      throw new BadRequestException('Widget not found');
    }
    await this.widgetRepository.delete(widget_id);
    return { success: true, message: 'Widget deleted successfully' };
  }

  async deleteWidgetBlock(widget_block_id: string) {
    const widgetBlock = await this.widgetBlockRepository.findOne({
      where: { id: widget_block_id },
    });
    if (!widgetBlock) {
      throw new BadRequestException('Widget block not found');
    }
    await this.widgetBlockRepository.delete(widget_block_id);
    return { success: true, message: 'Widget block deleted successfully' };
  }

  async deleteWidgetColumn(widget_column_id: string) {
    const widgetColumn = await this.widgetColumnRepository.findOne({
      where: { id: widget_column_id },
    });
    if (!widgetColumn) {
      throw new BadRequestException('Widget column not found');
    }
    await this.widgetColumnRepository.delete(widget_column_id);
    return { success: true, message: 'Widget column deleted successfully' };
  }

  async deleteWidgetType(widget_type_id: string) {
    const widgetType = await this.widgetTypeRepository.findOne({
      where: { id: widget_type_id },
    });
    if (!widgetType) {
      throw new BadRequestException('Widget type not found');
    }
    await this.widgetTypeRepository.delete(widget_type_id);
    return { success: true, message: 'Widget type deleted successfully' };
  }

  async deleteWidgetItem(widget_item_id: string) {
    const widgetItem = await this.widgetItemRepository.findOne({
      where: { id: widget_item_id },
    });
    if (!widgetItem) {
      throw new BadRequestException('Widget item not found');
    }
    await this.widgetItemRepository.delete(widget_item_id);
    return { success: true, message: 'Widget item deleted successfully' };
  }

  async deleteWidgetFilter(widget_filter_id: string) {
    const widgetFilter = await this.widgetFiltersRepository.findOne({
      where: { id: widget_filter_id },
    });
    if (!widgetFilter) {
      throw new BadRequestException('Widget filter not found');
    }
    await this.widgetFiltersRepository.delete(widget_filter_id);
    return { success: true, message: 'Widget filter deleted successfully' };
  }

  async deleteCombinedParameter(combined_parameter_id: string) {
    const combinedParameter = await this.combinedParameterRepository.findOne({
      where: { id: combined_parameter_id },
    });
    if (!combinedParameter) {
      throw new BadRequestException('Combined parameter not found');
    }
    await this.combinedParameterRepository.delete(combined_parameter_id);
    return {
      success: true,
      message: 'Combined parameter deleted successfully',
    };
  }

  async deleteCustomParameter(custom_parameter_id: string) {
    const customParameter = await this.customParameterRepository.findOne({
      where: { id: custom_parameter_id },
    });
    if (!customParameter) {
      throw new BadRequestException('Custom parameter not found');
    }
    await this.customParameterRepository.delete(custom_parameter_id);
    return { success: true, message: 'Custom parameter deleted successfully' };
  }

  async getWidgetChartList(param) {
    const { page, limit, skip, sort, filter } = param;
    const { is_deleted, search } = filter;
    const whereConditions: any = {
      is_deleted: is_deleted !== undefined ? is_deleted : false,
    };
    const query = {
      take: limit,
      skip,
      order: sort,
      where: whereConditions,
    };

    const qb = this.widgetTypeRepository
      .createQueryBuilder('widgetType')
      .leftJoinAndSelect('widgetType.widget_item', 'widget_item')
      .leftJoinAndSelect('widget_item.filters', 'filters')
      .leftJoinAndSelect('filters.public_question', 'public_question')
      .leftJoinAndSelect(
        'public_question.standard_question_options',
        'standard_question_options',
      )
      .leftJoinAndSelect(
        'widget_item.combined_parameters',
        'combined_parameters',
      )
      .leftJoinAndSelect(
        'combined_parameters.custom_parameter',
        'custom_parameter',
      )
      .where('widgetType.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('custom_parameter.createdAt', 'ASC');

    const widgets = await qb.getMany();

    return {
      success: true,
      data: widgets,
    };
  }
}
