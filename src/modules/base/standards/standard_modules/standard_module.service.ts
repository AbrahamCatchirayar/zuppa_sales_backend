/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
/* eslint-disable no-unused-expressions */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { consolidatedGrouping, JOIN_RELATIONS } from 'src/utils';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { Module } from '../../masters/modules/module.entity';
import { WidgetType } from '../../widgets/entities/widget_type.entity';
import { Standard } from '../standard.entity';
import { StandardIndicator } from '../standard_indicators/standard_indicator.entity';
import { StandardQuestion } from '../standard_questions/standard_question.entity';
import { StandardModule } from './standard_module.entity';
import { CreateStandardModuleDto, ModulesRemove } from './standard_modules.dto';

@Injectable()
export class StandardModuleService {
  constructor(
    @InjectRepository(StandardModule)
    private readonly standardModuleModel: Repository<StandardModule>,
    private readonly datasource: DataSource,
  ) {}

  // async onModuleInit() {
  //   const standardModules = await this.getConslidatedStandardModules(['f94f1266-f447-4a6e-a2f1-e6644a81d537']);
  //   console.info(standardModules);
  // }

  async createStandardModules(body: CreateStandardModuleDto) {
    const connection = this.datasource.createQueryRunner();
    await connection.connect();
    await connection.startTransaction();

    try {
      //   const standardModule = await this.standardModuleModel.findOne({
      //     where: { name: body.name },
      //   });
      //   if (standardModule) {
      //     throw new BadRequestException('Standard_Module already exist');
      //   }

      const standard = await connection.manager
        .getRepository(Standard)
        .findOne({ where: { id: body.standard_id } });

      if (!standard) {
        throw new BadRequestException('Invalid standard');
      }

      const module = await connection.manager
        .getRepository(Module)
        .findOne({ where: { id: body.master_module_id } });

      if (!module) {
        throw new BadRequestException('Invalid standard');
      }
      const standardModule = new StandardModule();
      standardModule.name = module.name;
      standardModule.description = module.description;
      // standardModule.sequence = body.sequence;
      standardModule.standard = standard;
      standardModule.master_module = module;

      await this.standardModuleModel.save(standardModule);
      await connection.commitTransaction();
      return {
        success: true,
        message: 'standard_modules created successfully',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await connection.release();
    }
  }

  async getAllStandardModules(param: any) {
    try {
      const { page, limit, skip, sort, filter } = param;

      const {
        search,
        is_deleted,
        masterModuleId,
        Standard_indicator,
        ...otherFilters
      } = filter;

      const whereCondition: any = {
        ...otherFilters,
        is_deleted: is_deleted !== undefined ? is_deleted : false,
      };

      const query = {
        take: limit,
        skip,
        order: sort,
        where: whereCondition,
        relations: [
          'standard',
          // 'master_module',
          // 'master_module.masterIndicator',
          // 'master_module.masterIndicator.questions',
          'standard_indicators',
          'standard_indicators.standard_questions',
          'standard_indicators.standard_questions.standard_question_options',
        ],
      };

      if ('is_deleted' in filter) {
        query.where.is_deleted = filter.is_deleted;
      }

      if ('search' in filter) {
        const { search } = filter;
        query.where = { ...query.where, name: ILike(`%${search}%`) };
      }

      if ('masterModuleId' in filter) {
        query.where = {
          ...query.where,
          master_module_id: { id: filter.masterModuleId },
        };
      }

      const [data, totalCount] =
        await this.standardModuleModel.findAndCount(query);
      // Load all standard indicators with their relationships
      const allStandardIndicator = await this.datasource.manager
        .getRepository(StandardIndicator)
        .find({
          relations: [
            'standard_modules.standard_indicators',
            'standard_modules.standard_indicators.standard_questions',
            'standard_modules.standard_indicators.standard_questions.standard_question_options',
          ],
        });

      // Map indicators to their respective modules
      const mapedIndicators = data.map((module) => {
        module.standard_indicators = allStandardIndicator.filter(
          (indicator) => indicator.standard_modules?.id === module.id,
        );
        return module;
      });

      const filteredIndicators = Standard_indicator
        ? mapedIndicators.filter((module) =>
            module.standard_indicators.some(
              (indicator) => indicator.id === Standard_indicator,
            ),
          )
        : mapedIndicators;

      return {
        success: true,
        Standard_modules: data,
        meta: {
          currentCount: data.length,
          currentPage: Number(page),
          currentLimit: Number(limit),
          totalCount: filteredIndicators.length,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getStandardModule(id: string) {
    const standardModule = await this.standardModuleModel.findOne({
      where: { id },
      relations: [
        'standard',
        'master_module',
        'master_module.masterIndicator',
        'master_module.masterIndicator.questions',
        'standard_indicators',
        'standard_indicators.standard_questions',
        'standard_indicators.standard_questions.standard_question_options',
      ],
    });
    if (!standardModule || standardModule.is_deleted === true) {
      throw new BadRequestException('Invalid standard_module');
    }
    return {
      success: true,
      standardModule,
    };
  }

  async deleteStandardModule(id: string) {
    const standardModule = await this.getStandardModule(id);
    if (standardModule.standardModule.is_deleted === true) {
      throw new BadRequestException('Standard_module already deleted');
    }

    await this.standardModuleModel.update(id, {
      is_deleted: true,
      deleted_at: new Date(),
    });
    return { success: true, message: 'StandardModule deleted successfully' };
  }

  async removeModules(standard_id: string, module_id: ModulesRemove) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const standard = await queryRunner.manager
        .getRepository(Standard)
        .findOne({ where: { id: standard_id } });

      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      const modulesToRemove = await queryRunner.manager
        .getRepository(StandardModule)
        .find({
          where: {
            id: In(module_id.id),
            standard: { id: standard.id },
          },
        });

      for (const module of modulesToRemove) {
        module.is_deleted = true;
        module.standard = null;
      }

      await queryRunner.manager
        .getRepository(StandardModule)
        .save(modulesToRemove);

      await queryRunner.commitTransaction();

      return { success: true, message: 'Module removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getConslidatedStandardModules(standard_ids: string[]) {
    const result = await this.datasource
      .getRepository(StandardModule)
      .createQueryBuilder('sm')
      .innerJoin('sm.standard', 's')
      .innerJoin('sm.master_module', 'mm')
      .innerJoin('sm.standard_indicators', 'si')
      .innerJoin('si.master_indicator', 'mi')
      .innerJoin('si.question_sequences', 'qs')
      .leftJoin('qs.standard_question_id', 'sq')
      .leftJoin('qs.group_questions', 'gq')
      .where('s.id IN (:...standardIds)', { standardIds: standard_ids })
      .select([
        'mm.id AS module_id',
        'mm.name AS module_name',
        'mi.id AS indicator_id',
        'mi.name AS indicator_name',
        'qs.id AS sequence_id',
        'qs.sequence AS sequence',
        'qs.questable_type AS questable_type',
        'sq.id AS sq_id',
        'sq.title AS sq_title',
        'gq.id AS gq_id',
        'gq.name AS gq_name',
      ])
      .getRawMany();
    const groupedModules = {};

    for (const row of result) {
      const {
        module_id,
        module_name,
        indicator_id,
        indicator_name,
        sequence_id,
        sequence,
        questable_type,
        sq_id,
        sq_title,
        gq_id,
        gq_name,
      } = row;

      if (!groupedModules[module_id]) {
        groupedModules[module_id] = {
          name: module_name,
          indicators: {},
        };
      }

      const module = groupedModules[module_id];

      if (!module.indicators[indicator_id]) {
        module.indicators[indicator_id] = {
          name: indicator_name,
          standard_question: new Map(),
          question_sequence: new Map(),
        };
      }

      const indicator = module.indicators[indicator_id];

      // Union question_sequences
      indicator.question_sequence.set(sequence_id, {
        id: sequence_id,
        sequence,
        questable_type,
      });

      // Union standard_questions
      if (sq_id) {
        indicator.standard_question.set(sq_id, {
          id: sq_id,
          title: sq_title,
        });
      }
    }

    // Final format
    return Object.values(groupedModules).map((mod: any) => ({
      name: mod.name,
      indicators: Object.values(mod.indicators).map((ind: any) => ({
        name: ind.name,
        standard_question: Array.from(ind.standard_question.values()),
        question_sequence: Array.from(ind.question_sequence.values()),
      })),
    }));
  }

  async getActiveStandardsName() {
    const standardRepo = this.datasource.manager.getRepository(Standard);

    const activeStandards = await standardRepo.find({
      where: { is_active: true },
      select: ['id', 'name'], // optional optimization
    });

    if (activeStandards.length === 0) {
      throw new BadRequestException('No active standards found');
    }

    // ✅ Wrap the object literal in parentheses
    return activeStandards.map((standard) => ({
      id: standard.id,
      name: standard.name,
    }));
  }

  async getActiveStandardIds() {
    const standardModules = await this.datasource.manager
      .getRepository(Standard)
      .find({
        where: { is_active: true },
      });
    if (standardModules.length === 0) {
      throw new BadRequestException('No active standards found');
    }
    return standardModules.map((standard) => standard.id);
  }

  async getConslidatedStandardModulesWithRelations(standard_ids: string[]) {
    // Use the original approach but with optimized query structure
    const standardModulesQuery = this.datasource.manager
      .getRepository(StandardModule)
      .createQueryBuilder('sm');

    // Apply only essential joins to avoid Cartesian product while maintaining data completeness
    standardModulesQuery
      .innerJoinAndSelect(
        
        'sm.standard',
       
        'standard',
       
        'standard.is_deleted = :isDeleted',
      )
      .innerJoinAndSelect(
        
        'sm.master_module',
       
        'master_module',
       
        'master_module.is_deleted = :isDeleted',
      )
      .innerJoinAndSelect(
        
        'sm.standard_indicators',
       
        'si',
       
        'si.is_deleted = :isDeleted',
      )
      .innerJoinAndSelect(
        
        'si.master_indicator',
       
        'master_indicator',
       
        'master_indicator.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'si.question_sequences',
       
        'qs',
       
        'qs.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'qs.standard_question_id',
       
        'standard_question',
       
        'standard_question.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'standard_question.mixed_questions',
       
        'mixed_questions',
       
        'mixed_questions.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'standard_question.standard_question_options',
       
        'standard_question_options',
       
        'standard_question_options.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'standard_question.sub_indicator_id',
       
        'standard_sub_indicators',
       
        'standard_sub_indicators.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'standard_question.department',
       
        'department',
       
        'department.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'qs.group_questions',
       
        'group_questions',
       
        'group_questions.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'group_questions.group_question_sequences',
       
        'gqs',
       
        'gqs.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'gqs.standard_question',
       
        'group_question_question',
       
        'group_question_question.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'group_question_question.standard_question_options',
       
        'group_question_options',
       
        'group_question_options.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'group_question_question.mixed_questions',
       
        'group_question_mixed_questions',
       
        'group_question_mixed_questions.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'qs.question_rules',
       
        'question_rules',
       
        'question_rules.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'question_rules.parent_question_id',
       
        'parent_question',
       
        'parent_question.is_deleted = :isDeleted',
      )
      .leftJoinAndSelect(
        
        'question_rules.parent_option_id',
       
        'parent_option',
       
        'parent_option.is_deleted = :isDeleted',
      );

    standardModulesQuery.setParameter('isDeleted', false);

    const standardModules = await standardModulesQuery
      .where('standard.id IN (:...standardIds)', { standardIds: standard_ids })
      .andWhere('sm.is_deleted = :smIsDeleted', { smIsDeleted: false })
      .getMany();

    return consolidatedGrouping(standardModules, standard_ids);
  }
  async getStandardModules(standard_id: string) {
    const standardModules = await this.datasource.manager
      .getRepository(StandardModule)
      .find({
        where: {
          standard: { id: standard_id },
          is_deleted: false,
        },
        relations: [
          'standard',
          'master_module',
          'standard_indicators',
          'standard_indicators.standard_questions',
          'standard_indicators.standard_questions.standard_question_options',
          'standard_indicators.standard_questions.mixed_questions',
          'standard_indicators.standard_questions.sub_indicator_id',
          'standard_indicators.question_sequences',
          'standard_indicators.question_sequences.standard_question_id',
          'standard_indicators.question_sequences.standard_question_id.standard_question_options',
          'standard_indicators.question_sequences.standard_question_id.mixed_questions',
          'standard_indicators.question_sequences.standard_question_id.sub_indicator_id',
          'standard_indicators.question_sequences.group_questions',
          'standard_indicators.question_sequences.group_questions.group_question_sequences',
          'standard_indicators.question_sequences.group_questions.group_question_sequences.standard_question',
          'standard_indicators.question_sequences.group_questions.group_question_sequences.standard_question.standard_question_options',
          'standard_indicators.question_sequences.group_questions.group_question_sequences.standard_question.mixed_questions',
        ],
      });

    return standardModules.map((module) => ({
      id: module.id,
      name: module.master_module?.name || null,
      indicators: module.standard_indicators
        ?.filter((indicator) => !indicator.is_deleted)
        ?.map((indicator) => ({
          id: indicator.id,
          name: indicator.name,
          sequence: indicator.sequence,

          standard_questions: indicator.standard_questions
            ?.filter((q) => !q.is_deleted)
            ?.map((q) => ({
              id: q.id,
              title: q.title,
              question_type: q.question_type,
              option_type: q.option_type,
              universal_question_id: q.universal_question_id,
              sub_indicator: q.sub_indicator_id
                ? {
                    id: q.sub_indicator_id.id,
                    name: q.sub_indicator_id.name,
                  }
                : null,
              standard_question_options: q.standard_question_options
                ?.filter((opt) => !opt.is_deleted)
                ?.map((opt) => ({
                  id: opt.id,
                  text: opt.text,
                  value: opt.value,
                })),
              mixed_questions: q.mixed_questions
                ?.filter((m) => !m.is_deleted)
                ?.map((m) => ({
                  id: m.id,
                  value_question_type: m.value_question_type,
                  value_name: m.value_name,
                  unit_enum: m.unit_enum,
                })),
            })),

          question_sequence: indicator.question_sequences
            ?.filter((qs) => !qs.is_deleted)
            ?.map((qs) => ({
              id: qs.id,
              sequence: qs.sequence,
              is_dependent: qs.is_dependent,
              questable_type: qs.questable_type,
              universal_question_id: qs.universal_question_id,

              // ✅ STANDARD question
              standard_question_id:
                qs.questable_type === 'STANDARD' &&
                qs.standard_question_id &&
                !qs.standard_question_id.is_deleted
                  ? {
                      id: qs.standard_question_id.id,
                      title: qs.standard_question_id.title,
                      question_type: qs.standard_question_id.question_type,
                      option_type: qs.standard_question_id.option_type,
                      universal_question_id:
                        qs.standard_question_id.universal_question_id,
                      sub_indicator: qs.standard_question_id.sub_indicator_id
                        ? {
                            id: qs.standard_question_id.sub_indicator_id.id,
                            name: qs.standard_question_id.sub_indicator_id.name,
                          }
                        : null,
                      standard_question_options:
                        qs.standard_question_id.standard_question_options?.map(
                          (opt) => ({
                            id: opt.id,
                            text: opt.text,
                            value: opt.value,
                          }),
                        ) || [],
                    }
                  : null,

              // ✅ GROUP question
              group_questions:
                qs.questable_type === 'GROUP' && qs.group_questions
                  ? {
                      id: qs.group_questions.id,
                      name: qs.group_questions.name,
                      group_question_sequences:
                        qs.group_questions.group_question_sequences?.map(
                          (gqs) => ({
                            id: gqs.id,
                            universal_question_id: gqs.universal_question_id,
                            standard_question: gqs.standard_question
                              ? {
                                  id: gqs.standard_question.id,
                                  title: gqs.standard_question.title,
                                  question_type:
                                    gqs.standard_question.question_type,
                                  option_type:
                                    gqs.standard_question.option_type,
                                  universal_question_id:
                                    gqs.standard_question.universal_question_id,
                                  standard_question_options:
                                    gqs.standard_question.standard_question_options?.map(
                                      (opt) => ({
                                        id: opt.id,
                                        text: opt.text,
                                        value: opt.value,
                                      }),
                                    ) || [],
                                  mixed_questions:
                                    gqs.standard_question.mixed_questions?.map(
                                      (mq) => ({
                                        id: mq.id,
                                        value_question_type:
                                          mq.value_question_type,
                                        value_name: mq.value_name,
                                        value_enum: mq.value_enum,
                                        unit_name: mq.unit_name,
                                        unit_type: mq.unit_type,
                                        unit_enum: mq.unit_enum,
                                      }),
                                    ) || [],
                                }
                              : null,
                          }),
                        ) || [],
                    }
                  : null,

              question_rules: qs.question_rules || [],
            })),
        })),
    }));
  }

  async getStandardQuestions(department_id: string) {
    const standardQuestions = await this.datasource.manager
      .getRepository(StandardQuestion)
      .find({
        where: { department: { id: department_id } },
        relations: [
          'standard_question_options',
          'mixed_questions',
          'standard_indicator.standard_modules',
          'sub_indicator_id',
        ],
      });
    return standardQuestions;
  }

  async getActiveStandardQuestions() {
    // const standardQuestions = await this.datasource.manager
    //   .getRepository(StandardQuestion).find({
    //     where: { is_deleted: false, standard_indicator: { standard_modules: { standard: { is_active: true } } } },
    //     select: ['id', 'title', 'universal_question_id', 'question_type'],
    //   })
    const standardQuestions = await this.datasource.manager
      .getRepository(StandardQuestion)
      .createQueryBuilder('q')
      .distinctOn(['q.universal_question_id']) // <-- UNIQUE
      .select([
        'q.id AS id',
        'q.title AS title',
        'q.universal_question_id AS universal_question_id',
        // 'q.question_type AS question_type',
      ])
      // .innerJoin('q.standard_indicator', 'si')
      // .innerJoin('si.standard_modules', 'sm')
      // .innerJoin('sm.standard', 's')
      .where('q.is_deleted = false')
      // .andWhere('s.is_active = true')
      .orderBy('q.universal_question_id') // REQUIRED for DISTINCT ON
      .addOrderBy('q.id') // tie-breaker if needed
      .getRawMany();
    // .getRepository(StandardQuestion).findOne({ where: { universal_question_id: uid, is_deleted: false },
    //   relations: [
    //     'standard_question_options',
    //     'mixed_questions',
    //     'standard_indicator.standard_modules',
    //     'sub_indicator_id',
    //   ],
    // });
    return standardQuestions;
  }

  async getActiveStandardQuestion(uid: string) {
    const standardQuestions = await this.datasource.manager
      .getRepository(StandardQuestion)
      .findOne({
        where: {
          universal_question_id: uid,
          is_deleted: false,
          standard_indicator: {
            standard_modules: { standard: { is_active: true } },
          },
        },
        // select: ['id', 'title', 'universal_question_id'],
        relations: [
          'standard_question_options',
          'mixed_questions',
          'standard_indicator.standard_modules',
          'sub_indicator_id',
        ],
      });
    return standardQuestions;
  }
}
