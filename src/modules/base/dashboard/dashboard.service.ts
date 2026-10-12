import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';

import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Standard } from 'src/modules/base/standards/standard.entity';
import { Department } from '../masters/departments/department.entity';
import {
  ChartType,
  DashboardDto,
  DashboardUpdateDto,
  Type,
} from './dashboard.dto';
import { Dashboard } from './entities/dashboard.entity';
import { DashboardBlock } from './entities/dashboard_block.entity';
import { DashboardColumn } from './entities/dashboard_column.entity';
import { DashboardCombinedParameter } from './entities/dashboard_combined_parameter.entity';
import { DashboardCustomParameter } from './entities/dashboard_custom_parameter.entity';
import { DashboardFilter } from './entities/dashboard_filter.entity';
import { DashboardItem } from './entities/dashboard_item.entity';
import { DashboardTab } from './entities/dashboard_tabs.entity';
import { DashboardType } from './entities/dashboard_type.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Dashboard)
    private readonly dashboardRepository: Repository<Dashboard>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Standard)
    private readonly standardRepository: Repository<Standard>,
    @InjectRepository(DashboardBlock)
    private readonly dashboardBlockRepository: Repository<DashboardBlock>,
    @InjectRepository(DashboardTab)
    private readonly dashboardTabRepository: Repository<DashboardTab>,
    @InjectRepository(DashboardColumn)
    private readonly dashboardColumnRepository: Repository<DashboardColumn>,
    @InjectRepository(DashboardType)
    private readonly dashboardTypeRepository: Repository<DashboardType>,
    @InjectRepository(DashboardItem)
    private readonly dashboardItemRepository: Repository<DashboardItem>,
    @InjectRepository(DashboardCombinedParameter)
    private readonly dashboardCombinedRepository: Repository<DashboardCombinedParameter>,
    @InjectRepository(DashboardCustomParameter)
    private readonly dashboardCustomParameterRepository: Repository<DashboardCustomParameter>,
    @InjectRepository(DashboardFilter)
    private readonly dashboardFilterRepository: Repository<DashboardFilter>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.dashboardRepository = this.dataSource.getRepository(Dashboard);
    this.departmentRepository = this.dataSource.getRepository(Department);
    this.standardRepository = this.dataSource.getRepository(Standard);
    this.dashboardBlockRepository =
     
      this.dataSource.getRepository(DashboardBlock);
    this.dashboardColumnRepository =
     
      this.dataSource.getRepository(DashboardColumn);
    this.dashboardTypeRepository = this.dataSource.getRepository(DashboardType);
    this.dashboardItemRepository = this.dataSource.getRepository(DashboardItem);
    this.dashboardCombinedRepository = this.dataSource.getRepository(
      DashboardCombinedParameter,
    );
    this.dashboardCustomParameterRepository = this.dataSource.getRepository(
      DashboardCustomParameter,
    );
    this.dashboardFilterRepository =
      this.dataSource.getRepository(DashboardFilter);
  }

  async getDashboards() {
    const query: any = {
      relations: [
        'department',
        'standard',
        'tabs',
        // 'tabs.dashboard_blocks',
        // 'tabs.dashboard_blocks.dashboard_columns',
        // 'tabs.dashboard_blocks.dashboard_columns.dashboard_types',
        // 'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items',
        'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.filters.public_question.standard_question_options',
        'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
      ],
    };
    const [dashboards, total] =
      await this.dashboardRepository.findAndCount(query);

    return {
      success: true,
      data: dashboards,
      total,
    };
  }

  // async getDashboardsTest() {
  //   try {
  //     const dashboards = await this.dashboardRepository.find({
  //       relations: [
  //         'department',
  //         'standard',
  //         'tabs',
  //         'tabs.dashboard_blocks',
  //         'tabs.dashboard_blocks.dashboard_columns',
  //         'tabs.dashboard_blocks.dashboard_columns.dashboard_types',
  //         'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items',
  //         'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.filters',
  //         'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.filters.public_question',
  //         'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.filters.public_question.standard_question_options',
  //         'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters',
  //         'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
  //       ],
  //       order: {
  //         sequence: 'ASC',
  //         tabs: {
  //           sequence: 'ASC',
  //           dashboard_blocks: {
  //             sequence: 'ASC',
  //             dashboard_columns: {
  //               sequence: 'ASC',
  //             },
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       success: true,
  //       data: dashboards.map((dashboard) => ({
  //         id: dashboard.id,
  //         createdAt: dashboard.createdAt,
  //         updatedAt: dashboard.updatedAt,
  //         is_deleted: dashboard.is_deleted,
  //         deleted_at: dashboard.deleted_at,
  //         name: dashboard.name,
  //         sequence: dashboard.sequence,
  //         number_of_tabs: dashboard.number_of_tabs,

  //         department: dashboard.department
  //           ? {
  //               id: dashboard.department.id,
  //               name: dashboard.department.name,
  //             }
  //           : null,

  //         standard: dashboard.standard
  //           ? {
  //               id: dashboard.standard.id,
  //               name: dashboard.standard.name,
  //             }
  //           : null,

  //         tabs:
  //           dashboard.tabs?.map((tab) => ({
  //             id: tab.id,
  //             createdAt: tab.createdAt,
  //             updatedAt: tab.updatedAt,
  //             is_deleted: tab.is_deleted,
  //             deleted_at: tab.deleted_at,
  //             name: tab.name,
  //             number_of_blocks: tab.number_of_blocks,
  //             sequence: tab.sequence,

  //             dashboard_blocks:
  //               tab.dashboard_blocks?.map((block) => ({
  //                 id: block.id,
  //                 createdAt: block.createdAt,
  //                 updatedAt: block.updatedAt,
  //                 is_deleted: block.is_deleted,
  //                 deleted_at: block.deleted_at,
  //                 sequence: block.sequence,
  //                 number_of_columns: block.number_of_columns,

  //                 dashboard_columns:
  //                   block.dashboard_columns?.map((col) => ({
  //                     id: col.id,
  //                     createdAt: col.createdAt,
  //                     updatedAt: col.updatedAt,
  //                     is_deleted: col.is_deleted,
  //                     deleted_at: col.deleted_at,
  //                     sequence: col.sequence,
  //                     number_of_items: col.number_of_items,

  //                     dashboard_types:
  //                       col.dashboard_types?.map((type) => ({
  //                         id: type.id,
  //                         createdAt: type.createdAt,
  //                         updatedAt: type.updatedAt,
  //                         is_deleted: type.is_deleted,
  //                         deleted_at: type.deleted_at,
  //                         type: type.type,
  //                         chart_type: type.chart_type,
  //                         is_stacked: type.is_stacked,
  //                         is_horizontal: type.is_horizontal,
  //                         is_metric: type.is_metric,
  //                         is_time_series: type.is_time_series,
  //                         latest_data: type.latest_data,

  //                         dashboard_items:
  //                           type.dashboard_items?.map((item) => ({
  //                             id: item.id,
  //                             createdAt: item.createdAt,
  //                             updatedAt: item.updatedAt,
  //                             is_deleted: item.is_deleted,
  //                             deleted_at: item.deleted_at,
  //                             title: item.title,
  //                             filter: item.filter,
  //                             filters: item.filters ?? [],

  //                             dashboard_combined_parameters:
  //                               item.dashboard_combined_parameters?.map(
  //                                 (cp) => ({
  //                                   id: cp.id,
  //                                   createdAt: cp.createdAt,
  //                                   updatedAt: cp.updatedAt,
  //                                   is_deleted: cp.is_deleted,
  //                                   deleted_at: cp.deleted_at,
  //                                   name: cp.name,

  //                                   dashboard_custom_parameters:
  //                                     cp.dashboard_custom_parameters?.map(
  //                                       (custom) => ({
  //                                         id: custom.id,
  //                                         createdAt: custom.createdAt,
  //                                         updatedAt: custom.updatedAt,
  //                                         is_deleted: custom.is_deleted,
  //                                         deleted_at: custom.deleted_at,
  //                                         name: custom.name,
  //                                         sequence: custom.sequence,
  //                                         questions: custom.questions,
  //                                         universal_questions:
  //                                           custom.universal_questions,
  //                                         macro_function: custom.macro_function,
  //                                         answer: custom.answer,
  //                                         unit: custom.unit,
  //                                         legends: custom.legends,
  //                                         label: custom.label,
  //                                         dashboard_id: custom.dashboard_id,
  //                                       }),
  //                                     ) ?? [],
  //                                 }),
  //                               ) ?? [],
  //                           })) ?? [],
  //                       })) ?? [],
  //                   })) ?? [],
  //               })) ?? [],
  //           })) ?? [],
  //       })),
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // async createDashboard(params: DashboardTestDto) {
  //     const queryRunner = this.dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();
  //     try {
  //       const dashboard = await Promise.all(
  //         params.dashboards.map(async (d_board) => {
  //          let department: Department | null = null;
  //           if (d_board.department_id && d_board.department_id.trim() !== '') {
  //             department = await queryRunner.manager
  //               .getRepository(Department)
  //               .findOne({
  //                 where: { id: d_board.department_id },
  //                 relations: ['standardQuestions'],
  //               });

  //             if (!department) {
  //               throw new BadRequestException('Department not found');
  //             }
  //           }

  //           // 🔹 2. Handle standard safely
  //           let standard: Standard | null = null;
  //           if (d_board.standard_id && d_board.standard_id.trim() !== '') {
  //             standard = await queryRunner.manager
  //               .getRepository(Standard)
  //               .findOne({ where: { id: d_board.standard_id } });

  //             if (!standard) {
  //               throw new BadRequestException('Standard not found');
  //             }
  //           }

  //           const existingDashboard = await queryRunner.manager
  //             .getRepository(Dashboard)
  //             .findOne({
  //               where: {
  //                 department: {
  //                   id: d_board.department_id,
  //                 },
  //               },
  //             });
  //           if (existingDashboard) {
  //             const updatedDashboard = await queryRunner.manager
  //               .getRepository(Dashboard)
  //               .update(existingDashboard.id, {
  //                 name: d_board.name,
  //                 sequence: d_board.sequence,
  //                 number_of_tabs:
  //                   d_board.tabs.length + existingDashboard.number_of_tabs,
  //                 department: existingDashboard.department,
  //                 standard: existingDashboard.standard,
  //               });
  //             await Promise.all(
  //               d_board.tabs.map(async (tab, tabIndex) => {
  //                 const existingTab = await queryRunner.manager
  //                   .getRepository(DashboardTab)
  //                   .findOne({
  //                     where: {
  //                       name: tab.name,
  //                       sequence: tabIndex+1,
  //                       dashboard: {
  //                         department: {
  //                           id: department.id,
  //                         },
  //                       },
  //                     },
  //                   });

  //                 let tabToUse;
  //                 if (existingTab) {
  //                   // Update existing tab with new block count
  //                   await queryRunner.manager
  //                     .getRepository(DashboardTab)
  //                     .update(existingTab.id, {
  //                       number_of_blocks: existingTab.number_of_blocks + tab.number_of_blocks.length,
  //                     });
  //                   tabToUse = existingTab;
  //                 } else {
  //                   // Create new tab
  //                   tabToUse = await queryRunner.manager
  //                     .getRepository(DashboardTab)
  //                     .save({
  //                       name: tab.name,
  //                       number_of_blocks: tab.number_of_blocks.length,
  //                       sequence: existingDashboard.sequence + 1,
  //                       dashboard: existingDashboard,
  //                     });
  //                 }

  //                 await Promise.all(
  //                   tab.number_of_blocks.map(async (block, blockIndex) => {
  //                     // Get the current block count for this tab to determine sequence
  //                     const currentBlockCount = await queryRunner.manager
  //                       .getRepository(DashboardBlock)
  //                       .count({
  //                         where: {
  //                           dashboard_tab: { id: tabToUse.id }
  //                         }
  //                       });

  //                     const newBlock = await queryRunner.manager
  //                       .getRepository(DashboardBlock)
  //                       .save({
  //                         sequence: currentBlockCount + blockIndex + 1,
  //                         number_of_columns: block.number_of_columns.length,
  //                         dashboard_tab: tabToUse,
  //                       });

  //                     await Promise.all(
  //                       block.number_of_columns.map(
  //                         async (column, columnIndex) => {
  //                           // Get the current column count for this block to determine sequence
  //                           const currentColumnCount = await queryRunner.manager
  //                             .getRepository(DashboardColumn)
  //                             .count({
  //                               where: {
  //                                 dashboard_block: { id: newBlock.id }
  //                               }
  //                             });

  //                           const newColumn = await queryRunner.manager
  //                             .getRepository(DashboardColumn)
  //                             .save({
  //                               sequence: currentColumnCount + columnIndex + 1,
  //                               number_of_items: column.dashboard_items.length,
  //                               dashboard_block: newBlock,
  //                             });

  //                           // Always create new DashboardType for each column
  //                           const dashboardTypeToUse = await queryRunner.manager
  //                             .getRepository(DashboardType)
  //                             .save({
  //                               type: column.dashboard_type,
  //                               chart_type: column.chart_type,
  //                               dashboard_column: newColumn,
  //                               is_stacked: column.isStacked,
  //                               is_horizontal: column.isHorizontal,
  //                               is_metric: column.isMetric,
  //                               is_time_series: column.isTimeSeries,
  //                               latest_data: column.latestData,
  //                             });

  //                           await Promise.all(
  //                             column.dashboard_items.map(
  //                               async (dashboard_item) => {
  //                                 // Always create new DashboardItem
  //                                 const dashboardItemToUse = await queryRunner.manager
  //                                   .getRepository(DashboardItem)
  //                                   .save({
  //                                     title: dashboard_item.title,
  //                                     dashboard_type: dashboardTypeToUse,
  //                                     filter: dashboard_item.filter,
  //                                   });

  //                                 if (dashboard_item.filter) {
  //                                   await Promise.all(
  //                                     dashboard_item.filters.map(
  //                                       async (filter, filter_index) => {
  //                                         // Always create new DashboardFilter
  //                                         await queryRunner.manager
  //                                           .getRepository(DashboardFilter)
  //                                           .save({
  //                                             public_question: { id: filter.public_question_id },
  //                                             universal_question_id: filter.universal_question_id,
  //                                             is_option: filter.is_option,
  //                                             dashboard_item: dashboardItemToUse,
  //                                             sequence: filter_index + 1,
  //                                           });
  //                                       },
  //                                     ),
  //                                   );
  //                                 }

  //                                 await Promise.all(
  //                                   dashboard_item.combined_parameters.map(
  //                                     async (combined_parameter) => {
  //                                       // Always create new DashboardCombinedParameter
  //                                       const combinedParameterToUse = await queryRunner.manager
  //                                         .getRepository(DashboardCombinedParameter)
  //                                         .save({
  //                                           name: combined_parameter.name,
  //                                           dashboard_item: dashboardItemToUse,
  //                                         });

  //                                       await Promise.all(
  //                                         combined_parameter.custom_parameters.map(
  //                                           async (custom_parameter, custom_parameter_index) => {
  //                                             // Always create new DashboardCustomParameter
  //                                             await queryRunner.manager
  //                                               .getRepository(DashboardCustomParameter)
  //                                               .save({
  //                                                 name: custom_parameter.name,
  //                                                 questions: custom_parameter.questions,
  //                                                 macro_function: custom_parameter.macro_function,
  //                                                 answer: null,
  //                                                 unit: custom_parameter.unit,
  //                                                 legends: custom_parameter.legends,
  //                                                 label: custom_parameter.label,
  //                                                 dashboard_combined_parameter: combinedParameterToUse,
  //                                                 universal_questions: custom_parameter.universal_questions,
  //                                                 dashboard_id: existingDashboard.id,
  //                                                 sequence: custom_parameter_index + 1,
  //                                               });
  //                                           },
  //                                         ),
  //                                       );
  //                                     },
  //                                   ),
  //                                 );
  //                               },
  //                             ),
  //                           );
  //                         },
  //                       ),
  //                     );
  //                   }),
  //                 );
  //               }),
  //             );
  //             return updatedDashboard;
  //           }
  //           const newDashboard = await queryRunner.manager
  //             .getRepository(Dashboard)
  //             .save({
  //               name: d_board.name,
  //               sequence: d_board.sequence,
  //               number_of_tabs: d_board.tabs.length,
  //               department,
  //               standard,
  //             });
  //           await Promise.all(
  //             d_board.tabs.map(async (tab, tabIndex) => {
  //               if (!tab.number_of_blocks.length) {
  //                 throw new BadRequestException('Number of block is required');
  //               }

  //               const existingTab = await queryRunner.manager
  //                 .getRepository(DashboardTab)
  //                 .findOne({
  //                   where: {
  //                     name: tab.name,
  //                     dashboard: {
  //                       department: {
  //                         id: department.id,
  //                       },
  //                     },
  //                   },
  //                 });

  //               let tabToUse;
  //               if (existingTab) {
  //                 // Update existing tab with new block count
  //                 await queryRunner.manager
  //                   .getRepository(DashboardTab)
  //                   .update(existingTab.id, {
  //                     number_of_blocks: existingTab.number_of_blocks + tab.number_of_blocks.length,
  //                   });
  //                 tabToUse = existingTab;
  //               } else {
  //                 // Create new tab
  //                 tabToUse = await queryRunner.manager
  //                   .getRepository(DashboardTab)
  //                   .save({
  //                     name: tab.name,
  //                     number_of_blocks: tab.number_of_blocks.length,
  //                     sequence: tabIndex + 1,
  //                     dashboard: newDashboard,
  //                   });
  //               }
  //               await Promise.all(
  //                 tab.number_of_blocks.map(async (block, blockIndex) => {
  //                   if (!block.number_of_columns) {
  //                     throw new BadRequestException(
  //                       'Number of columns is required',
  //                     );
  //                   }

  //                   // Get the current block count for this tab to determine sequence
  //                   const currentBlockCount = await queryRunner.manager
  //                     .getRepository(DashboardBlock)
  //                     .count({
  //                       where: {
  //                         dashboard_tab: { id: tabToUse.id }
  //                       }
  //                     });

  //                   const newDashboardBlock = await queryRunner.manager
  //                     .getRepository(DashboardBlock)
  //                     .save({
  //                       number_of_columns: block.number_of_columns.length,
  //                       sequence: currentBlockCount + blockIndex + 1,
  //                       dashboard_tab: tabToUse,
  //                     });
  //                   await Promise.all(
  //                     block.number_of_columns.map(async (column, columnIndex) => {
  //                       if (!column) {
  //                         throw new BadRequestException(
  //                           'Colimn data is required',
  //                         );
  //                       }

  //                       // Get the current column count for this block to determine sequence
  //                       const currentColumnCount = await queryRunner.manager
  //                         .getRepository(DashboardColumn)
  //                         .count({
  //                           where: {
  //                             dashboard_block: { id: newDashboardBlock.id }
  //                           }
  //                         });

  //                       const newWidgetColumn = await queryRunner.manager
  //                         .getRepository(DashboardColumn)
  //                         .save({
  //                           sequence: currentColumnCount + columnIndex + 1,
  //                           number_of_items: column.dashboard_items.length,
  //                           dashboard_block: newDashboardBlock,
  //                         });
  //                       if (!column.dashboard_type) {
  //                         throw new BadRequestException(
  //                           'Widget type is required',
  //                         );
  //                       }

  //                       if (Object.values(Type).includes(column.dashboard_type)) {
  //                         if (column.dashboard_type === Type.CHART) {
  //                           if (
  //                             !column.chart_type ||
  //                             !Object.values(ChartType).includes(
  //                               column.chart_type,
  //                             )
  //                           ) {
  //                             throw new BadRequestException(
  //                               'Chart type is required when widget is chart',
  //                             );
  //                           }
  //                         }

  //                         if (!column.dashboard_items) {
  //                           throw new BadRequestException(
  //                             'Widget items are required',
  //                           );
  //                         }

  //                         // Always create new DashboardType
  //                         const widgetTypeToUse = await queryRunner.manager
  //                           .getRepository(DashboardType)
  //                           .save({
  //                             type: column.dashboard_type,
  //                             chart_type: column.dashboard_type === Type.CHART ? column.chart_type : null,
  //                             dashboard_column: newWidgetColumn,
  //                             is_stacked: column.isStacked,
  //                             is_horizontal: column.isHorizontal,
  //                             is_metric: column.isMetric,
  //                             is_time_series: column.isTimeSeries,
  //                             latest_data: column.latestData,
  //                           });
  //                         const widgetItem = await Promise.all(
  //                           column.dashboard_items.map(async (dashboard_item) => {
  //                             // Always create new DashboardItem
  //                             const dashboardItemToUse = await queryRunner.manager
  //                               .getRepository(DashboardItem)
  //                               .save({
  //                                 title: dashboard_item.title,
  //                                 dashboard_type: widgetTypeToUse,
  //                                 filter: dashboard_item.filter,
  //                               });
  //                             if (dashboard_item.filter) {
  //                               await Promise.all(
  //                                 dashboard_item.filters.map(async (filter, filter_index) => {
  //                                   // Always create new DashboardFilter
  //                                   await queryRunner.manager
  //                                     .getRepository(DashboardFilter)
  //                                     .save({
  //                                       public_question: { id: filter.public_question_id },
  //                                       universal_question_id: filter.universal_question_id,
  //                                       is_option: filter.is_option,
  //                                       dashboard_item: dashboardItemToUse,
  //                                       sequence: filter_index + 1,
  //                                     });
  //                               }),
  //                             );
  //                             }
  //                                 await Promise.all(
  //                                   dashboard_item.combined_parameters.map(
  //                                     async (combined_parameter) => {
  //                                       // Always create new DashboardCombinedParameter
  //                                       const combinedParameterToUse = await queryRunner.manager
  //                                         .getRepository(DashboardCombinedParameter)
  //                                         .save({
  //                                           name: combined_parameter.name,
  //                                           dashboard_item: dashboardItemToUse,
  //                                         });
  //                                       await Promise.all(
  //                                         combined_parameter.custom_parameters.map(
  //                                           async (custom_parameter, custom_parameter_index) => {
  //                                             // Check if DashboardCustomParameter already exists
  //                                             const existingCustomParameter = await queryRunner.manager
  //                                               .getRepository(DashboardCustomParameter)
  //                                               .findOne({
  //                                                 where: {
  //                                                   name: custom_parameter.name,
  //                                                   dashboard_combined_parameter: { id: combinedParameterToUse.id },
  //                                                 },
  //                                               });

  //                                             if (!existingCustomParameter) {
  //                                               // Create new custom parameter only if it doesn't exist
  //                                               await queryRunner.manager
  //                                                 .getRepository(DashboardCustomParameter)
  //                                                 .save({
  //                                                   name: custom_parameter.name,
  //                                                   questions: custom_parameter.questions,
  //                                                   universal_questions: custom_parameter.universal_questions,
  //                                                   macro_function: custom_parameter.macro_function,
  //                                                   unit: custom_parameter.unit,
  //                                                   legends: custom_parameter.legends,
  //                                                   label: custom_parameter.label,
  //                                                   dashboard_combined_parameter: combinedParameterToUse,
  //                                                   dashboard_id: newDashboard.id,
  //                                                   sequence: custom_parameter_index + 1,
  //                                                 });
  //                                             }
  //                                           },
  //                                         ),
  //                                       );
  //                                     },
  //                                   ),
  //                                 );
  //                           })
  //                         );
  //                       } else {
  //                         throw new BadRequestException('Invalid widget type');
  //                       }
  //                     }),
  //                   );
  //                 }),
  //               );
  //             }),
  //           );
  //           return newDashboard;
  //         }),
  //       );

  //       await queryRunner.commitTransaction();
  //       return {
  //         success: true,
  //         message: 'Dashboard widget created successfully',
  //         // data: dashboard,
  //       };
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       throw new BadRequestException(error.message);
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   }
  async getChartList(param) {
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
    };;

    const qb = this.dashboardTypeRepository
      .createQueryBuilder('dashboardType')
      .leftJoinAndSelect('dashboardType.dashboard_items', 'dashboard_items')
      .leftJoinAndSelect('dashboard_items.filters', 'filters')
      .leftJoinAndSelect('filters.public_question', 'public_question')
      .leftJoinAndSelect(
        'public_question.standard_question_options',
        'standard_question_options',
      )
      .leftJoinAndSelect(
        'dashboard_items.dashboard_combined_parameters',
        'dashboard_combined_parameters',
      )
      .leftJoinAndSelect(
        'dashboard_combined_parameters.dashboard_custom_parameters',
        'dashboard_custom_parameters',
      )
      .where('dashboardType.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('dashboard_custom_parameters.createdAt', 'ASC');

    const dasboardCharts = await qb.getMany();

    return {
      success: true,
      data: dasboardCharts,
    };;
  }

  async createDashboard(params: DashboardDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dashboards = await Promise.all(
        params.dashboards.map(async (d_board) => {
          // Normalize incoming IDs
          const departmentId = d_board.department_id?.trim() || null;
          const standardId = d_board.standard_id?.trim() || null;

          // 1) Load department if provided
          let department: Department | null = null;
          if (departmentId) {
            department = await queryRunner.manager
              .getRepository(Department)
              .findOne({
                where: { id: departmentId },
                relations: ['standardQuestions'],
              });
            if (!department)
              throw new BadRequestException('Department not found');
          }

          // 2) Load standard if provided
          let standard: Standard | null = null;
          if (standardId) {
            standard = await queryRunner.manager
              .getRepository(Standard)
              .findOne({ where: { id: standardId } });
            if (!standard) throw new BadRequestException('Standard not found');
          }

          // 3) Find existing dashboard
          let existingDashboard: Dashboard | null = null;
          if (departmentId) {
            existingDashboard = await queryRunner.manager
              .getRepository(Dashboard)
              .findOne({
                where: { department: { id: departmentId } },
                relations: ['department', 'standard'],
              });
          } else if (standardId) {
            existingDashboard = await queryRunner.manager
              .getRepository(Dashboard)
              .findOne({
                where: { standard: { id: standardId } },
                relations: ['department', 'standard'],
              });
          }

          // Helper to handle blocks/columns/items
          const handleBlocksColumns = async (
            blocksArr,
            tabEntity: DashboardTab,
            dashboardEntity: Dashboard,
          ) => {
            await Promise.all(
              (blocksArr || []).map(async (block, blockIndex) => {
                const currentBlockCount = await queryRunner.manager
                  .getRepository(DashboardBlock)
                  .count({ where: { dashboard_tab: { id: tabEntity.id } } });

                const newBlock = await queryRunner.manager
                  .getRepository(DashboardBlock)
                  .save({
                    sequence: currentBlockCount + blockIndex + 1,
                    number_of_columns: (block.number_of_columns || []).length,
                    dashboard_tab: tabEntity,
                  });

                await Promise.all(
                  (block.number_of_columns || []).map(
                    async (column, columnIndex) => {
                      const currentColumnCount = await queryRunner.manager
                        .getRepository(DashboardColumn)
                        .count({
                          where: { dashboard_block: { id: newBlock.id } },
                        });

                      const newColumn = await queryRunner.manager
                        .getRepository(DashboardColumn)
                        .save({
                          sequence: currentColumnCount + columnIndex + 1,
                          number_of_items: (column.dashboard_items || [])
                            .length,
                          dashboard_block: newBlock,
                        });

                      // dashboard type validations
                      if (!column.dashboard_type)
                        throw new BadRequestException(
                          'Widget type is required',
                        );
                      if (!Object.values(Type).includes(column.dashboard_type))
                        throw new BadRequestException('Invalid widget type');
                      if (
                        column.dashboard_type === Type.CHART &&
                        (!column.chart_type ||
                          !Object.values(ChartType).includes(column.chart_type))
                      )
                        throw new BadRequestException(
                          'Chart type is required when widget is chart',
                        );

                      const dashboardType = await queryRunner.manager
                        .getRepository(DashboardType)
                        .save({
                          type: column.dashboard_type,
                          chart_type:
                            column.dashboard_type === Type.CHART
                              ? column.chart_type
                              : null,
                          dashboard_column: newColumn,
                          is_stacked: !!column.isStacked,
                          is_horizontal: !!column.isHorizontal,
                          is_metric: !!column.isMetric,
                          is_time_series: !!column.isTimeSeries,
                          latest_data: !!column.latestData,
                        });

                      // dashboard items
                      await Promise.all(
                        (column.dashboard_items || []).map(
                          async (dashboard_item) => {
                            const dashboardItem = await queryRunner.manager
                              .getRepository(DashboardItem)
                              .save({
                                title: dashboard_item.title,
                                dashboard_type: dashboardType,
                                filter: !!dashboard_item.filter,
                              });

                            // filters
                            if (dashboard_item.filter) {
                              await Promise.all(
                                (dashboard_item.filters || []).map(
                                  async (filter, filter_index) => {
                                    await queryRunner.manager
                                      .getRepository(DashboardFilter)
                                      .save({
                                        public_question: {
                                          id: filter.public_question_id,
                                        },
                                        universal_question_id:
                                          filter.universal_question_id,
                                        is_option: filter.is_option,
                                        dashboard_item: dashboardItem,
                                        sequence: filter_index + 1,
                                      });
                                  },
                                ),
                              );
                            }

                            // combined parameters -> custom parameters
                            await Promise.all(
                              (dashboard_item.combined_parameters || []).map(
                                async (combined_parameter) => {
                                  const combinedParam =
                                   
                                        await queryRunner.manager
                                        .getRepository(
                                            DashboardCombinedParameter,
                                          )
                                        .save({
                                          name: combined_parameter.name,
                                          dashboard_item: dashboardItem,
                                        });

                                  const existingCustomCount =
                                    await queryRunner.manager
                                      .getRepository(DashboardCustomParameter)
                                      .count({
                                        where: {
                                          dashboard_combined_parameter: {
                                            id: combinedParam.id,
                                          },
                                        },
                                      });

                                  await Promise.all(
                                    (
                                      combined_parameter.custom_parameters || []
                                    ).map(
                                      async (
                                        custom_parameter,
                                        custom_parameter_index,
                                      ) => {
                                        const existingCustomParam =
                                          await queryRunner.manager
                                            .getRepository(
                                              DashboardCustomParameter,
                                            )
                                            .findOne({
                                              where: {
                                                name: custom_parameter.name,
                                                dashboard_combined_parameter: {
                                                  id: combinedParam.id,
                                                },
                                              },
                                            });

                                        if (!existingCustomParam) {
                                          await queryRunner.manager
                                            .getRepository(
                                              DashboardCustomParameter,
                                            )
                                            .save({
                                              name: custom_parameter.name,
                                              questions:
                                                custom_parameter.questions,
                                              universal_questions:
                                                custom_parameter.universal_questions,
                                              macro_function:
                                                custom_parameter.macro_function,
                                              answer: null,
                                              unit: custom_parameter.unit,
                                              legends: custom_parameter.legends,
                                              label: custom_parameter.label,
                                              dashboard_combined_parameter:
                                                combinedParam,
                                              dashboard_id: dashboardEntity.id,
                                              sequence:
                                                existingCustomCount +
                                                custom_parameter_index +
                                                1,
                                            });
                                        }
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
          };

          // Function to handle tabs (for both new and existing dashboards)
          const handleTabs = async (dashboardEntity: Dashboard) => {
            const existingTabsCount = await queryRunner.manager
              .getRepository(DashboardTab)
              .count({ where: { dashboard: { id: dashboardEntity.id } } });

            await Promise.all(
              (d_board.tabs || []).map(async (tab, tabIndex) => {
                const tabSequence = existingTabsCount + tabIndex + 1;

                const existingTab = await queryRunner.manager
                  .getRepository(DashboardTab)
                  .findOne({
                    where: {
                      name: tab.name,
                      dashboard: { id: dashboardEntity.id },
                    },
                  });

                let tabToUse: DashboardTab;
                if (existingTab) {
                  await queryRunner.manager
                    .getRepository(DashboardTab)
                    .update(existingTab.id, {
                      sequence: tabSequence,
                      number_of_blocks:
                        (existingTab.number_of_blocks || 0) +
                        (tab.number_of_blocks || []).length,
                    });
                  tabToUse = await queryRunner.manager
                    .getRepository(DashboardTab)
                    .findOne({
                      where: { id: existingTab.id },
                    });
                } else {
                  tabToUse = await queryRunner.manager
                    .getRepository(DashboardTab)
                    .save({
                      name: tab.name,
                      number_of_blocks: (tab.number_of_blocks || []).length,
                      sequence: tabSequence,
                      dashboard: dashboardEntity,
                    });
                }

                await handleBlocksColumns(
                  tab.number_of_blocks || [],
                  tabToUse,
                  dashboardEntity,
                );
              }),
            );
          };

          // Update existing dashboard
          if (existingDashboard) {
            await queryRunner.manager
              .getRepository(Dashboard)
              .update(existingDashboard.id, {
                name: d_board.name,
                sequence: d_board.sequence,
                number_of_tabs:
                  (existingDashboard.number_of_tabs || 0) +
                  (d_board.tabs || []).length,
                department: existingDashboard.department ?? null,
                standard: standard ?? existingDashboard.standard ?? null,
              });

            const updatedDashboardEntity = await queryRunner.manager
              .getRepository(Dashboard)
              .findOne({ where: { id: existingDashboard.id } });

            if (!updatedDashboardEntity)
              throw new BadRequestException(
                'Failed to fetch updated dashboard',
              );

            await handleTabs(updatedDashboardEntity);

            return updatedDashboardEntity;
          }

          // Create new dashboard
          const newDashboard = await queryRunner.manager
            .getRepository(Dashboard)
            .save({
              name: d_board.name,
              sequence: d_board.sequence,
              number_of_tabs: (d_board.tabs || []).length,
              department: department ?? null,
              standard: standard ?? null,
            });

          await handleTabs(newDashboard);

          return newDashboard;
        }),
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Dashboard widget created successfully',
        data: dashboards,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error?.message || 'Failed to create dashboard',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getDashboardByDeptId(department_id: string) {
    const dasboard = await this.departmentRepository.findOne({
      where: {
        id: department_id,
      },
      relations: [
        'dashboards',
        'dashboards.tabs',
        // 'dashboards.tabs.dashboard_blocks',
        // 'dashboards.tabs.dashboard_blocks.dashboard_columns',
        // 'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types',
        // 'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items',
        'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.filters.public_question.standard_question_options',
        // 'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters',
        'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
      ],
    });
    return dasboard;
  }

  async getDashboardByStandardId(standard_id: string) {
    try {
      const dashboard = await this.standardRepository.findOne({
        where: { id: standard_id },
        relations: [
          'dashboards',
          'dashboards.tabs',
          // 'dashboards.tabs.dashboard_blocks',
          // 'dashboards.tabs.dashboard_blocks.dashboard_columns',
          // 'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types',
          // 'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items',
          'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.filters.public_question.standard_question_options',
          // 'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters',
          'dashboards.tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
        ],
      });

      if (!dashboard) {
        throw new Error(`No dashboard found for standard ID: ${standard_id}`);
      }

      return dashboard;
    } catch (error) {
      console.error('Error fetching dashboard by standard ID:', error);
      // Optional: Throw a NestJS exception so Swagger returns an error response
      throw new BadRequestException(
        `Failed to fetch dashboard for standard ID: ${standard_id}. ${error.message}`,
      );
    }
  }

  async updateDashboard(dashboard_id: string, params: DashboardUpdateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const dashboard = await queryRunner.manager
        .getRepository(Dashboard)
        .findOne({
          where: { id: dashboard_id },
          relations: [
            'tabs',
            // 'tabs.dashboard_blocks',
            // 'tabs.dashboard_blocks.dashboard_columns',
            // 'tabs.dashboard_blocks.dashboard_columns.dashboard_types',
            // 'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.filters.public_question.standard_question_options',
            // 'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters',
            'tabs.dashboard_blocks.dashboard_columns.dashboard_types.dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
          ],
        });

      if (!dashboard) {
        throw new BadRequestException('Dashboard not found');
      }

      // Update dashboard basic fields
      await queryRunner.manager.getRepository(Dashboard).update(dashboard.id, {
        sequence: params.sequence,
        name: params.name,
      });

      // Process dashboard tabs
      await Promise.all(
        params.tabs.map(async (tab, index) => {
          const sequence = tab.sequence ?? index + 1;
          let dashboardTab;

          // Check if this is an existing tab (has valid UUID ID) or new tab (no ID)
          if (tab?.id && tab.id.trim() !== '') {
            // Try to find existing tab
            dashboardTab = await queryRunner.manager
              .getRepository(DashboardTab)
              .findOne({
                where: { id: tab.id },
              });

            if (dashboardTab) {
              // Update existing tab
              await queryRunner.manager
                .getRepository(DashboardTab)
                .update(dashboardTab.id, {
                  name: tab.name,
                  number_of_blocks: tab.number_of_blocks.length,
                  sequence,
                });
            }
          }

          // If tab doesn't exist or is new (no ID), create it
          if (!dashboardTab) {
            // Get max sequence from existing tabs
            const maxSequence = await queryRunner.manager
              .getRepository(DashboardTab)
              .createQueryBuilder('dt')
              .select('MAX(dt.sequence)', 'maxSeq')
              .where('dt.dashboard.id = :dashboardId', {
                dashboardId: dashboard.id,
              })
              .getRawOne();

            const newSequence = (maxSequence?.maxSeq || 0) + 1;

            dashboardTab = await queryRunner.manager
              .getRepository(DashboardTab)
              .save({
                id: tab?.id && tab.id.trim() !== '' ? tab.id : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                name: tab.name,
                number_of_blocks: tab.number_of_blocks.length,
                sequence: newSequence,
                dashboard: { id: dashboard.id },
              });
          }

          // Process dashboard blocks
          await Promise.all(
            tab.number_of_blocks.map(async (block) => {
              let dashboardBlock;

              // Check if this is an existing block (has valid UUID ID) or new block (no ID)
              if (block?.id && block.id.trim() !== '') {
                // Try to find existing block
                dashboardBlock = await queryRunner.manager
                  .getRepository(DashboardBlock)
                  .findOne({
                    where: { id: block.id },
                  });

                if (dashboardBlock) {
                  // Update existing block
                  await queryRunner.manager
                    .getRepository(DashboardBlock)
                    .update(dashboardBlock.id, {
                      number_of_columns: block.number_of_columns.length,
                    });
                }
              }

              // If block doesn't exist or is new (no ID), create it
              if (!dashboardBlock) {
                // Get max sequence from existing blocks
                const maxSequence = await queryRunner.manager
                  .getRepository(DashboardBlock)
                  .createQueryBuilder('db')
                  .select('MAX(db.sequence)', 'maxSeq')
                  .where('db.dashboard_tab.id = :dashboardTabId', {
                    dashboardTabId: dashboardTab.id,
                  })
                  .getRawOne();

                const newSequence = (maxSequence?.maxSeq || 0) + 1;

                dashboardBlock = await queryRunner.manager
                  .getRepository(DashboardBlock)
                  .save({
                    id:
                      block?.id && block.id.trim() !== ''
                        ? block.id
                        : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                    number_of_columns: block.number_of_columns.length,
                    sequence: newSequence,
                    dashboard_tab: { id: dashboardTab.id },
                  });
              }
              // Process dashboard columns
              await Promise.all(
                block.number_of_columns.map(async (column) => {
                  let dashboardColumn;

                  // Check if this is an existing column (has valid UUID ID) or new column (no ID)
                  if (column?.id && column.id.trim() !== '') {
                    // Try to find existing column
                    dashboardColumn = await queryRunner.manager
                      .getRepository(DashboardColumn)
                      .findOne({
                        where: { id: column.id },
                      });

                    if (dashboardColumn) {
                      // Update existing column
                      await queryRunner.manager
                        .getRepository(DashboardColumn)
                        .update(dashboardColumn.id, {
                          number_of_items: column.dashboard_items.length,
                        });
                    }
                  }

                  // If column doesn't exist or is new (no ID), create it
                  if (!dashboardColumn) {
                    // Get max sequence from existing columns
                    const maxSequence = await queryRunner.manager
                      .getRepository(DashboardColumn)
                      .createQueryBuilder('dc')
                      .select('MAX(dc.sequence)', 'maxSeq')
                      .where('dc.dashboard_block.id = :dashboardBlockId', {
                        dashboardBlockId: dashboardBlock.id,
                      })
                      .getRawOne();

                    const newSequence = (maxSequence?.maxSeq || 0) + 1;

                    dashboardColumn = await queryRunner.manager
                      .getRepository(DashboardColumn)
                      .save({
                        id:
                          column?.id && column.id.trim() !== ''
                            ? column.id
                            : undefined, // Only use valid UUIDs, let TypeORM generate for new ones
                        number_of_items: column.dashboard_items.length,
                        sequence: newSequence,
                        dashboard_block: { id: dashboardBlock.id },
                      });
                  }

                  // ---- Process dashboard type for this column (single type in DTO) ----
                  let dashboardType: DashboardType | undefined;
                  // Try to find an existing type for this column
                  dashboardType = await queryRunner.manager
                    .getRepository(DashboardType)
                    .createQueryBuilder('dt')
                    .where('dt.dashboard_column_id = :colId', {
                      colId: dashboardColumn.id,
                    })
                    .getOne();

                  if (dashboardType) {
                    // Update existing
                    await queryRunner.manager
                      .getRepository(DashboardType)
                      .update(dashboardType.id, {
                        type: column.dashboard_type,
                        chart_type: column.chart_type,
                        is_stacked: column.isStacked,
                        is_horizontal: column.isHorizontal,
                        is_metric: column.isMetric,
                        is_time_series: column.isTimeSeries,
                        latest_data: column.latestData,
                      });
                  } else if (column.dashboard_type) {
                    // Create new
                    dashboardType = await queryRunner.manager
                      .getRepository(DashboardType)
                      .save({
                        type: column.dashboard_type,
                        chart_type: column.chart_type,
                        is_stacked: column.isStacked,
                        is_horizontal: column.isHorizontal,
                        is_metric: column.isMetric,
                        is_time_series: column.isTimeSeries,
                        latest_data: column.latestData,
                        dashboard_column: { id: dashboardColumn.id },
                      });
                  }

                  // ---- Process dashboard items under the type ----
                  if (dashboardType && Array.isArray(column.dashboard_items)) {
                    await Promise.all(
                      column.dashboard_items.map(async (dashboard_item) => {
                        let existingDashboardItem;
                        if (
                          dashboard_item?.id &&
                          dashboard_item.id.trim() !== ''
                        ) {
                          existingDashboardItem = await queryRunner.manager
                            .getRepository(DashboardItem)
                            .findOne({ where: { id: dashboard_item.id } });
                        }

                        if (existingDashboardItem) {
                          await queryRunner.manager
                            .getRepository(DashboardItem)
                            .update(existingDashboardItem.id, {
                              title: dashboard_item.name, // map DTO name -> entity title
                              filter: !!dashboard_item.filter,
                              dashboard_type: { id: dashboardType.id },
                            });
                        } else {
                          existingDashboardItem = await queryRunner.manager
                            .getRepository(DashboardItem)
                            .save({
                              id:
                                dashboard_item?.id &&
                                dashboard_item.id.trim() !== ''
                                  ? dashboard_item.id
                                  : undefined,
                              title: dashboard_item.name,
                              filter: !!dashboard_item.filter,
                              dashboard_type: { id: dashboardType.id },
                            });
                        }

                        // ---- Filters ----
                        if (dashboard_item.filter) {
                          await Promise.all(
                            dashboard_item.filters.map(async (filter) => {
                              let existingFilter;
                              if (filter?.id && filter.id.trim() !== '') {
                                existingFilter = await queryRunner.manager
                                  .getRepository(DashboardFilter)
                                  .findOne({ where: { id: filter.id } });
                              }
                              if (!existingFilter) {
                                existingFilter = await queryRunner.manager
                                  .getRepository(DashboardFilter)
                                  .findOne({
                                    where: {
                                      dashboard_item: {
                                        id: existingDashboardItem.id,
                                      },
                                      public_question: {
                                        id: filter.public_question_id,
                                      },
                                    },
                                  });
                              }

                              if (existingFilter) {
                                await queryRunner.manager
                                  .getRepository(DashboardFilter)
                                  .update(existingFilter.id, {
                                    public_question: filter.public_question_id
                                      ? { id: filter.public_question_id }
                                      : null,
                                    universal_question_id:
                                      filter.universal_question_id,
                                    is_option: filter.is_option,
                                    sequence: filter.sequence,
                                  });
                              } else {
                                await queryRunner.manager
                                  .getRepository(DashboardFilter)
                                  .save({
                                    public_question: filter.public_question_id
                                      ? { id: filter.public_question_id }
                                      : null,
                                    universal_question_id:
                                      filter.universal_question_id,
                                    is_option: filter.is_option,
                                    dashboard_item: {
                                      id: existingDashboardItem.id,
                                    },
                                    sequence: filter.sequence,
                                  });
                              }
                            }),
                          );
                        }

                        // ---- Combined parameters ----
                        if (Array.isArray(dashboard_item.combined_parameters)) {
                          await Promise.all(
                            dashboard_item.combined_parameters.map(
                              async (combined_parameter) => {
                                let existingCombinedParameter;
                                if (
                                  combined_parameter?.id &&
                                  combined_parameter.id.trim() !== ''
                                ) {
                                  existingCombinedParameter =
                                    await queryRunner.manager
                                      .getRepository(DashboardCombinedParameter)
                                      .findOne({
                                        where: { id: combined_parameter.id },
                                      });
                                }
                                if (!existingCombinedParameter) {
                                  existingCombinedParameter =
                                    await queryRunner.manager
                                      .getRepository(DashboardCombinedParameter)
                                      .findOne({
                                        where: {
                                          dashboard_item: {
                                            id: existingDashboardItem.id,
                                          },
                                          name: combined_parameter.name,
                                        },
                                      });
                                }

                                if (existingCombinedParameter) {
                                  await queryRunner.manager
                                    .getRepository(DashboardCombinedParameter)
                                    .update(existingCombinedParameter.id, {
                                      name: combined_parameter.name,
                                    });
                                } else {
                                  existingCombinedParameter =
                                    await queryRunner.manager
                                      .getRepository(DashboardCombinedParameter)
                                      .save({
                                        id:
                                          combined_parameter?.id &&
                                          combined_parameter.id.trim() !== ''
                                            ? combined_parameter.id
                                            : undefined,
                                        name: combined_parameter.name,
                                        dashboard_item: {
                                          id: existingDashboardItem.id,
                                        },
                                      });
                                }

                                // ---- Custom parameters ----
                                if (
                                  Array.isArray(
                                    combined_parameter.custom_parameters,
                                  )
                                ) {
                                  await Promise.all(
                                    combined_parameter.custom_parameters.map(
                                      async (
                                        custom_parameter,
                                        custom_parameter_index,
                                      ) => {
                                        let existingCustomParameter;
                                        if (
                                          custom_parameter?.id &&
                                          custom_parameter.id.trim() !== ''
                                        ) {
                                          existingCustomParameter =
                                            await queryRunner.manager
                                              .getRepository(
                                                DashboardCustomParameter,
                                              )
                                              .findOne({
                                                where: {
                                                  id: custom_parameter.id,
                                                },
                                              });
                                        }
                                        if (existingCustomParameter) {
                                          await queryRunner.manager
                                            .getRepository(
                                              DashboardCustomParameter,
                                            )
                                            .update(
                                              existingCustomParameter.id,
                                              {
                                                name: custom_parameter.name,
                                                questions:
                                                  custom_parameter.questions,
                                                macro_function:
                                                  custom_parameter.macro_function,
                                                unit: custom_parameter.unit,
                                                legends:
                                                  custom_parameter.legends,
                                                label: custom_parameter.label,
                                                dashboard_id: dashboard.id,
                                                sequence:
                                                  custom_parameter.sequence ??
                                                  existingCustomParameter.sequence,
                                              },
                                            );
                                        } else {
                                          const maxSequence =
                                            await queryRunner.manager
                                              .getRepository(
                                                DashboardCustomParameter,
                                              )
                                              .createQueryBuilder('dcp')
                                              .select(
                                                'MAX(dcp.sequence)',
                                                'maxSeq',
                                              )
                                              .where(
                                                'dcp.dashboard_combined_parameter.id = :dashboardCombinedParameterId',
                                                {
                                                  dashboardCombinedParameterId:
                                                    existingCombinedParameter.id,
                                                },
                                              )
                                              .getRawOne();
                                          const newSequence =
                                            (maxSequence?.maxSeq || 0) + 1;
                                          await queryRunner.manager
                                            .getRepository(
                                              DashboardCustomParameter,
                                            )
                                            .save({
                                              id:
                                                custom_parameter?.id &&
                                                custom_parameter.id.trim() !==
                                                  ''
                                                  ? custom_parameter.id
                                                  : undefined,
                                              name: custom_parameter.name,
                                              questions:
                                                custom_parameter.questions,
                                              macro_function:
                                                custom_parameter.macro_function,
                                              unit: custom_parameter.unit,
                                              legends: custom_parameter.legends,
                                              label: custom_parameter.label,
                                              dashboard_id: dashboard.id,
                                              dashboard_combined_parameter: {
                                                id: existingCombinedParameter.id,
                                              },
                                              sequence: newSequence,
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
                }),
              );
            }),
          );
        }),
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Dashboard updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDashboard(dashboard_id: string) {
    const dashboard = await this.dashboardRepository.findOne({
      where: { id: dashboard_id },
    });
    if (!dashboard) {
      throw new BadRequestException('Dashboard not found');
    }
    await this.dashboardRepository.delete(dashboard_id);
    return {
      success: true,
      message: 'Dashboard deleted successfully',
    };
  }

  async deleteDashboardTab(dashboard_tab_id: string) {
    const dashboardTab = await this.dashboardTabRepository.findOne({
      where: { id: dashboard_tab_id },
    });
    if (!dashboardTab) {
      throw new BadRequestException('Dashboard tab not found');
    }
    await this.dashboardTabRepository.delete(dashboard_tab_id);
    return {
      success: true,
      message: 'Dashboard tab deleted successfully',
    };
  }

  async deleteDashboardBlock(dashboard_block_id: string) {
    const dashboardBlock = await this.dashboardBlockRepository.findOne({
      where: { id: dashboard_block_id },
    });
    if (!dashboardBlock) {
      throw new BadRequestException('Dashboard block not found');
    }
    await this.dashboardBlockRepository.delete(dashboard_block_id);
    return {
      success: true,
      message: 'Dashboard block deleted successfully',
    };
  }

  async deleteDashboardColumn(dashboard_column_id: string) {
    const dashboardColumn = await this.dashboardColumnRepository.findOne({
      where: { id: dashboard_column_id },
    });
    if (!dashboardColumn) {
      throw new BadRequestException('Dashboard column not found');
    }
    await this.dashboardColumnRepository.delete(dashboard_column_id);
    return {
      success: true,
      message: 'Dashboard column deleted successfully',
    };
  }

  async deleteDashboardType(dashboard_type_id: string) {
    const dashboardType = await this.dashboardTypeRepository.findOne({
      where: { id: dashboard_type_id },
    });
    if (!dashboardType) {
      throw new BadRequestException('Dashboard type not found');
    }
    await this.dashboardTypeRepository.delete(dashboard_type_id);
    return {
      success: true,
      message: 'Dashboard type deleted successfully',
    };
  }

  async deleteDashboardItem(dashboard_item_id: string) {
    const dashboardItem = await this.dashboardItemRepository.findOne({
      where: { id: dashboard_item_id },
    });
    if (!dashboardItem) {
      throw new BadRequestException('Dashboard item not found');
    }
    await this.dashboardItemRepository.delete(dashboard_item_id);
    return {
      success: true,
      message: 'Dashboard item deleted successfully',
    };
  }

  async deleteDashboardFilter(dashboard_filter_id: string) {
    const dashboardFilter = await this.dashboardFilterRepository.findOne({
      where: { id: dashboard_filter_id },
    });
    if (!dashboardFilter) {
      throw new BadRequestException('Dashboard filter not found');
    }

    await this.dashboardFilterRepository.delete(dashboard_filter_id);
    return {
      success: true,
      message: 'Dashboard filter deleted successfully',
    };
  }

  async deleteDashboardCombinedParameter(
    dashboard_combined_parameter_id: string,
  ) {
    const dashboardCombinedParameter =
      await this.dashboardCombinedRepository.findOne({
        where: { id: dashboard_combined_parameter_id },
      });
    if (!dashboardCombinedParameter) {
      throw new BadRequestException('Dashboard combined parameter not found');
    }

    await this.dashboardCombinedRepository.delete(
      dashboard_combined_parameter_id,
    );
    return {
      success: true,
      message: 'Dashboard combined parameter deleted successfully',
    };
  }

  async deleteDashboardCustomParameter(dashboard_custom_parameter_id: string) {
    const dashboardCustomParameter =
      await this.dashboardCustomParameterRepository.findOne({
        where: { id: dashboard_custom_parameter_id },
      });
    if (!dashboardCustomParameter) {
      throw new BadRequestException('Dashboard custom parameter not found');
    }
    await this.dashboardCustomParameterRepository.delete(
      dashboard_custom_parameter_id,
    );
    return {
      success: true,
      message: 'Dashboard custom parameter deleted successfully',
    };
  }
}
