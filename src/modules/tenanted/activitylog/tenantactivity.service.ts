import { Inject, Injectable } from '@nestjs/common';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { ActivityType } from 'src/utils';
import { DataSource, Not, Repository } from 'typeorm';
import { Datacube } from '../datacubes/datacube.entity';
import { DataCubeTask } from '../datacubes/task/task.entity';
import { User } from '../user/entities/user.entity';
import { TenantActivity } from './tenantactivity.entity';

@Injectable()
export class TenantActivityService {
  private readonly activityModel: Repository<TenantActivity>;

  private readonly connection: DataSource;

  constructor(
    @Inject(CONNECTION)
    connection: DataSource,
  ) {
    this.connection = connection;
    this.activityModel = connection.getRepository(TenantActivity);
  }

  // ✅ Helper function to avoid duplication
  private simplifyActivityResults(results: TenantActivity[]) {
    return results.map((activity) => {
      if (activity.task?.task_questions?.length > 0) {
        const moduleName =
          activity.task.task_questions[0]?.question_sequence
            ?.public_module_name;
        return {
          ...activity,
          task: {
            ...activity.task,
            module_name: moduleName || null,
            task_questions: undefined,
          },
        };
      }
      return activity;
    });
  }

  async getAll(param: any) {
    const { limit, skip, sort = 'DESC', filter, sortBy, page } = param;

    const validSort =
      String(sort || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // If search or created_date is used → switch to QueryBuilder
    if (filter?.search || filter?.created_date) {
      const qb = this.activityModel
        .createQueryBuilder('activity')
        .leftJoinAndSelect('activity.task', 'task')
        .leftJoinAndSelect('task.datacube_frequency', 'datacube_frequency')
        .leftJoinAndSelect('task.site', 'site')
        .leftJoinAndSelect('site.business_unit', 'business_unit')
        .leftJoinAndSelect('task.task_questions', 'task_questions')
        .leftJoinAndSelect(
          'task_questions.question_sequence',
          'question_sequence',
        )
        .leftJoinAndSelect('activity.datacube', 'datacube')
        .leftJoinAndSelect('activity.user', 'user')
        .where('activity.is_deleted = false')
        .andWhere('activity.activity_type != :excludedType', {
          excludedType: ActivityType.TASK_REVIEWING,
        });

      qb.select([
        'activity.id',
        'activity.createdAt',
        'activity.updatedAt',
        'activity.is_deleted',
        'activity.deleted_at',
        'activity.activity_type',
        'task.id',
        'datacube_frequency.id',
        'datacube_frequency.frequency_name',
        'site.id',
        'site.name',
        'site.location',
        'business_unit.id',
        'business_unit.name',
        'task_questions.id',
        'question_sequence.id',
        'question_sequence.public_module_id',
        'question_sequence.public_module_name',
        'datacube.id',
        'datacube.name',
        'user.id',
        'user.name',
        'user.role',
      ]);

      if (filter.search) {
        const searchableColumns = [
          'activity.activity_type',
          'datacube.name',
          'user.name',
          'question_sequence.public_module_name', // ✅ Added module name search
        ];

        qb.andWhere(
          `(${searchableColumns.map((col) => `${col} ILIKE :search`).join(' OR ')})`,
          { search: `%${filter.search}%` },
        );
      }

      if (filter.created_date) {
        qb.andWhere('DATE(activity.created_at) = :createdDate', {
          createdDate: filter.created_date,
        });
      }

      if (sortBy) qb.orderBy(sortBy, validSort);
      else qb.orderBy('activity.createdAt', validSort);

      qb.take(limit).skip(skip);

      const [results, count] = await qb.getManyAndCount();

      // ✅ Use helper function instead of duplicate code
      const simplifiedResults = this.simplifyActivityResults(results);

      return {
        results: simplifiedResults,
        count,
        page: Number(page || 1),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
      };
    }

    // When NOT searching → simple repository query
    const Query: any = {
      take: limit,
      skip,
      order: { createdAt: validSort },
      where: {
        is_deleted: false,
        activity_type: Not(ActivityType.TASK_REVIEWING),
      },
      relations: {
        task: {
          datacube_frequency: true,
          site: {
            business_unit: true,
          },
          task_questions: {
            question_sequence: true,
          },
        },
        datacube: true,
        user: true,
      },
      select: {
        task: {
          id: true,
          task_questions: {
            id: true,
            question_sequence: {
              id: true,
              public_module_id: true,
              public_module_name: true,
            },
          },
          datacube_frequency: {
            id: true,
            frequency_name: true,
          },
          site: {
            id: true,
            name: true,
            location: true,
            business_unit: {
              id: true,
              name: true,
            },
          },
        },
        datacube: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          name: true,
          role: true,
        },
      },
    };

    const allowedFilters = [
      'activity_type',
      'datacube_id',
      'task_id',
      'user_id',
    ];

    if (filter) {
      for (const key of allowedFilters) {
        if (filter[key]) Query.where[key] = filter[key];
      }

      // Date filtering - filter by exact date
      if (filter.created_date) {
        Query.where.createdAt = filter.created_date;
      }
    }

    const [results, count] = await this.activityModel.findAndCount(Query);

    // ✅ Use helper function instead of duplicate code
    const simplifiedResults = this.simplifyActivityResults(results);

    return {
      results: simplifiedResults,
      count,
      page: Number(page || 1),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  async findOne(id: string) {
    return this.activityModel.findOne({
      where: { id },
      relations: {
        task: {
          datacube_frequency: true,
          site: {
            business_unit: true,
          },
        },
        datacube: true,
        user: true,
      },
      select: {
        task: {
          id: true,
          datacube_frequency: {
            id: true,
            frequency_name: true,
          },
          site: {
            id: true,
            name: true,
            location: true,
            business_unit: {
              id: true,
              name: true,
            },
          },
        },
        datacube: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          name: true,
          role: true,
        },
      },
    });
  }

  async createTenantActivity(
    activity_type: ActivityType,
    datacube_id: Datacube | string,
    task_id: DataCubeTask | string | null,
    user_id: User,
    queryRunner?: any,
  ) {
    const shouldManageTransaction = !queryRunner;
    if (shouldManageTransaction) {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const datacubeId =
        typeof datacube_id === 'string' ? datacube_id : datacube_id?.id;
      const taskId = task_id
        ? typeof task_id === 'string'
          ? task_id
          : task_id?.id
        : null;

      const activity = await queryRunner.manager.insert(TenantActivity, {
        activity_type,
        datacube: datacubeId,
        task: taskId ? ({ id: taskId } as DataCubeTask) : null,
        user: { id: user_id.id } as User,
      });

      if (shouldManageTransaction) {
        await queryRunner.commitTransaction();
      }
      return activity;
    } catch (error) {
      if (shouldManageTransaction) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      if (shouldManageTransaction) {
        await queryRunner.release();
      }
    }
  }

  async updateTenantActivity(
    activity_type: ActivityType,
    datacube_id: string,
    task_id: string,
    user_id: User,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();
    try {
      const activity = await queryRunner.manager.save(TenantActivity, {
        activity_type,
        datacube: { id: datacube_id } as Datacube,
        task: task_id ? ({ id: task_id } as any) : null,
        user: { id: user_id.id } as User,
      });
      await queryRunner.commitTransaction();
      return activity;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTenantActivity(id: string) {
    return this.activityModel.delete(id);
  }
}