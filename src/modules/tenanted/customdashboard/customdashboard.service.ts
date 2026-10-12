import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DashboardType } from 'src/modules/base/dashboard/entities/dashboard_type.entity';
import { WidgetType } from 'src/modules/base/widgets/entities/widget_type.entity';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { DataSource, ILike, Repository } from 'typeorm';
import {
  CustomDashboardDto,
  CustomDashboardUpdateDto,
} from './customdashboard.dto';
import { CustomDashboardBlock } from './entities/block.entity';
import { CustomDashboardColumn } from './entities/column.entity';
import { CustomDashboard } from './entities/custom_dashboard.entity';
import { CustomDashboardType } from './entities/custom_dashboard_type.entity';

@Injectable()
export class CustomDashboardService {
  constructor(
    @InjectRepository(CustomDashboard)
    private readonly customDashboardRepository: Repository<CustomDashboard>,

    @InjectRepository(WidgetType)
    private readonly widgetItemRepository: Repository<WidgetType>,

    @InjectRepository(DashboardType)
    private readonly dashboardItemRepository: Repository<DashboardType>,

    @Inject(CONNECTION)
    private readonly dataSource: DataSource,
  ) {
    this.customDashboardRepository =
      this.dataSource.getRepository(CustomDashboard);
  }

  async getAllCustomDashboards(param) {
    const { page, limit, skip, sort, filter } = param;
    const { otherFilter, is_deleted, search } = filter;
    const whereConditions: any = {
      ...otherFilter,
      is_deleted: is_deleted !== undefined ? is_deleted : false,
    };
    const query = {
      take: limit,
      // skip,
      order: sort,
      where: whereConditions,
      relations: [
        'blocks.columns.types.customType.customItems.combinedParameters.customParameters',
      ],
    };

    if (search) {
      query.where = [
        {
          ...whereConditions,
          name: ILike(`%${search}%`),
        },
      ];
    }
    const [data, totalCount] =
      await this.customDashboardRepository.findAndCount(query);

    for (const widget of data) {
      for (const block of widget.blocks) {
        for (const column of block.columns) {
          for (const type of column.types) {
            // Attach widget_type_obj and dashboard_type_obj for full object, keep id for compatibility
            if (type.widget_type_id) {
              const widget_type_obj = await this.widgetItemRepository.findOne({
                where: { id: type.widget_type_id },
                relations: ['widget_item.combined_parameters.custom_parameter'],
              });
              (type as any).widget_type_obj = widget_type_obj;
            }
            if (type.dashboard_type_id) {
              const dashboard_type_obj =
                await this.dashboardItemRepository.findOne({
                  where: { id: type.dashboard_type_id },
                  relations: [
                    'dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
                  ],
                });
              (type as any).dashboard_type_obj = dashboard_type_obj;
            }
          }
        }
      }
    }

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

  async getCustomDashboardById(id: string) {
    const data = await this.customDashboardRepository.findOne({
      where: { id },
      relations: [
        'blocks.columns.types.customType.customItems.combinedParameters.customParameters',
      ],
    });
    if (!data) {
      throw new BadRequestException('Custom dashboard not found');
    }

    for (const block of data.blocks) {
      for (const column of block.columns) {
        for (const type of column.types) {
          // Attach widget_type_obj and dashboard_type_obj for full object, keep id for compatibility
          if (type.widget_type_id) {
            const widget_type_obj = await this.widgetItemRepository.findOne({
              where: { id: type.widget_type_id },
              relations: ['widget_item.combined_parameters.custom_parameter'],
            });
            (type as any).widget_type_obj = widget_type_obj;
          }
          if (type.dashboard_type_id) {
            const dashboard_type_obj =
              await this.dashboardItemRepository.findOne({
                where: { id: type.dashboard_type_id },
                relations: [
                  'dashboard_items.dashboard_combined_parameters.dashboard_custom_parameters',
                ],
              });
            (type as any).dashboard_type_obj = dashboard_type_obj;
          }
        }
      }
    }
    return {
      success: true,
      data,
    };
  }

  async createCustomDashboard(params: CustomDashboardDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const dashboard = await this.customDashboardRepository.findOne({
        where: { name: params.name },
      });
      if (dashboard) {
        throw new BadRequestException('Custom dashboard already exists');
      }

      const newDashboard = await queryRunner.manager
        .getRepository(CustomDashboard)
        .save({
          name: params.name,
          number_of_blocks: params.number_of_blocks,
          sequence: params.sequence,
        });
      await Promise.all(
        params.blocks.map(async (block) => {
          const dashboardBlock = await queryRunner.manager
            .getRepository(CustomDashboardBlock)
            .save({
              sequence: block.sequence,
              customDashboard: { id: newDashboard.id },
              number_of_columns: block.number_of_columns,
            });
          await Promise.all(
            block.columns.map(async (column) => {
              const dashboardColumn = await queryRunner.manager
                .getRepository(CustomDashboardColumn)
                .save({
                  sequence: column.sequence,
                  customDashboardBlock: { id: dashboardBlock.id },
                });
              await Promise.all(
                column.types.map(async (type) => {
                  await queryRunner.manager
                    .getRepository(CustomDashboardType)
                    .save({
                      widget_type_id: type?.widget_type_id || null,
                      dashboard_type_id: type?.dashboard_type_id || null,
                      customType: type?.custom_type_id
                        ? { id: type.custom_type_id }
                        : null,
                      customDashboardColumn: { id: dashboardColumn.id },
                    });
                }),
              );
            }),
          );
        }),
      );

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Custom dashboard created successfully',
        // data: newDashboard,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async updateCustomDashboard_1(id: string, params: CustomDashboardUpdateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const dashboard = await queryRunner.manager
        .getRepository(CustomDashboard)
        .findOne({ where: { id } });
      if (!dashboard) {
        throw new BadRequestException('Custom dashboard not found');
      }
      await queryRunner.manager.getRepository(CustomDashboard).update(id, {
        name: params.name,
      });

      for (const block of params.blocks) {
        let dashboardBlock = null;
        if (block.id) {
          dashboardBlock = await queryRunner.manager
            .getRepository(CustomDashboardBlock)
            .findOne({ where: { id: block.id } });
          if (dashboardBlock) {
            await queryRunner.manager
              .getRepository(CustomDashboardBlock)
              .update(dashboardBlock.id, {
                sequence: block.sequence,
                number_of_columns: block.number_of_columns,
              });
          }
        }
        if (!dashboardBlock) {
          dashboardBlock = await queryRunner.manager
            .getRepository(CustomDashboardBlock)
            .save({
              sequence: block.sequence,
              customDashboard: { id },
              number_of_columns: block.number_of_columns,
            });
        }

        for (const column of block.columns) {
          let dashboardColumn = null;
          if (column.id) {
            dashboardColumn = await queryRunner.manager
              .getRepository(CustomDashboardColumn)
              .findOne({ where: { id: column.id } });
            if (dashboardColumn) {
              await queryRunner.manager
                .getRepository(CustomDashboardColumn)
                .update(dashboardColumn.id, {
                  sequence: column.sequence,
                  customDashboardBlock: { id: dashboardBlock.id },
                });
            }
          }
          if (!dashboardColumn) {
            dashboardColumn = await queryRunner.manager
              .getRepository(CustomDashboardColumn)
              .save({
                sequence: column.sequence,
                customDashboardBlock: { id: dashboardBlock.id },
              });
          }

          for (const type of column.types) {
            let dashboardType = null;
            if (type.id) {
              dashboardType = await queryRunner.manager
                .getRepository(CustomDashboardType)
                .findOne({ where: { id: type.id } });
              if (dashboardType) {
                await queryRunner.manager
                  .getRepository(CustomDashboardType)
                  .update(dashboardType.id, {
                    widget_type_id: type.widget_type_id,
                    dashboard_type_id: type.dashboard_type_id,
                    customType: type.custom_type_id
                      ? { id: type.custom_type_id }
                      : null,
                  });
              }
            }
            if (!dashboardType) {
              dashboardType = await queryRunner.manager
                .getRepository(CustomDashboardType)
                .save({
                  widget_type_id: type.widget_type_id,
                  dashboard_type_id: type.dashboard_type_id,
                  customType: type.custom_type_id
                    ? { id: type.custom_type_id }
                    : null,
                  customDashboardColumn: { id: dashboardColumn.id },
                });
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Custom dashboard updated successfully',
        // data: dashboard,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async updateCustomDashboard(id: string, params: CustomDashboardUpdateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dashboardRepo = queryRunner.manager.getRepository(CustomDashboard);
      const blockRepo = queryRunner.manager.getRepository(CustomDashboardBlock);
      const columnRepo = queryRunner.manager.getRepository(
        CustomDashboardColumn,
      );
      const typeRepo = queryRunner.manager.getRepository(CustomDashboardType);

      const normalizeId = (id: any) => {
        return id && typeof id === 'string' && id.trim() !== '' ? id : null;
      };

      // 1. Validate dashboard
      const dashboard = await dashboardRepo.findOne({ where: { id } });
      if (!dashboard) {
        throw new BadRequestException('Custom dashboard not found');
      }

      // 2. Update dashboard
      await dashboardRepo.update(id, { name: params.name });

      // 3. Process Blocks
      for (const block of params.blocks) {
        let dashboardBlock;

        // --- Update Existing Block ---
        const blockId = normalizeId(block.id);
        if (blockId) {
          dashboardBlock = await blockRepo.findOne({ where: { id: block.id } });

          if (!dashboardBlock) {
            throw new BadRequestException(
              `Block with id ${block.id} does not exist`,
            );
          }

          await blockRepo.update(block.id, {
            sequence: block.sequence,
            number_of_columns: block.number_of_columns,
          });
        } else {
          // --- Create New Block ---
          dashboardBlock = await blockRepo.save({
            sequence: block.sequence,
            number_of_columns: block.number_of_columns,
            customDashboard: { id },
          });
        }

        // 4. Process Columns inside each Block
        for (const column of block.columns) {
          let dashboardColumn;

          // --- Update Existing Column ---
          const columnId = normalizeId(column.id);
          if (columnId) {
            dashboardColumn = await columnRepo.findOne({
              where: { id: column.id },
            });

            if (!dashboardColumn) {
              throw new BadRequestException(
                `Column with id ${column.id} does not exist`,
              );
            }

            await columnRepo.update(column.id, {
              sequence: column.sequence,
              customDashboardBlock: { id: dashboardBlock.id },
            });
          } else {
            // --- Create New Column ---
            dashboardColumn = await columnRepo.save({
              sequence: column.sequence,
              customDashboardBlock: { id: dashboardBlock.id },
            });
          }

          // 5. Process Types inside each Column
          for (const type of column.types) {
            let dashboardType;

            // --- Update Existing Type ---
            const typeId = normalizeId(type.id);
            if (typeId) {
              dashboardType = await typeRepo.findOne({
                where: { id: type.id },
              });

              if (!dashboardType) {
                throw new BadRequestException(
                  `Type with id ${type.id} does not exist`,
                );
              }

              await typeRepo.update(type.id, {
                widget_type_id: type.widget_type_id,
                dashboard_type_id: type.dashboard_type_id,
                customType: type.custom_type_id
                  ? { id: type.custom_type_id }
                  : null,
              });
            } else {
              // --- Create New Type ---
              await typeRepo.save({
                widget_type_id: type.widget_type_id,
                dashboard_type_id: type.dashboard_type_id,
                customType: type.custom_type_id
                  ? { id: type.custom_type_id }
                  : null,
                customDashboardColumn: { id: dashboardColumn.id },
              });
            }
          }
        }
      }
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Custom dashboard updated successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCustomDashboard(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const dashboard = await queryRunner.manager
        .getRepository(CustomDashboard)
        .findOne({
          where: { id },
        });
      if (!dashboard) {
        throw new BadRequestException('Custom dashboard not found');
      }
      await queryRunner.manager.getRepository(CustomDashboard).delete(id);
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Custom dashboard deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCustomDashboardBlock(block_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const block = await queryRunner.manager
        .getRepository(CustomDashboardBlock)
        .findOne({ where: { id: block_id } });
      if (!block) {
        throw new BadRequestException('Custom dashboard block not found');
      }
      await queryRunner.manager
        .getRepository(CustomDashboardBlock)
        .delete(block_id);
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Custom dashboard block deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCustomDashboardColumn(column_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const column = await queryRunner.manager
        .getRepository(CustomDashboardColumn)
        .findOne({ where: { id: column_id } });
      if (!column) {
        throw new BadRequestException('Custom dashboard column not found');
      }
      await queryRunner.manager
        .getRepository(CustomDashboardColumn)
        .delete(column_id);
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Custom dashboard column deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCustomDashboardType(type_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const type = await queryRunner.manager
        .getRepository(CustomDashboardType)
        .findOne({ where: { id: type_id } });
      if (!type) {
        throw new BadRequestException('Custom dashboard type not found');
      }
      await queryRunner.manager
        .getRepository(CustomDashboardType)
        .delete(type_id);
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Custom dashboard type deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
