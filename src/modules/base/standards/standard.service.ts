/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuestableType } from 'src/enum/questiontype.enum';
import { FileService } from 'src/file-storage/file-storage.service';
import { DataSource, ILike, In, QueryRunner, Repository } from 'typeorm';
import { Indicator } from '../masters/indicators/indicator.entity';
import { Module } from '../masters/modules/module.entity';
import { Question } from '../masters/questions/question.entity';
import {
  AddModulesIndicatorsQuestionsToStandardDto,
  AddModulesIndicatorsQuestionsToStandardDto_opt,
  CreateIndicatorForStandardDto,
  CreateModuleForStandardDto,
  CreateStandardQuestionsDto,
  SequenceItemDto,
  StandardDto,
  StandardSequenceType,
  UpdateAddRemoveQuestionSequenceDto,
  UpdateQuestionRulesDto,
  UpdateStandardDto,
} from './standard.dto';

import { MixedTypeQuestion } from '../masters/questions/mixed_type_question.entity';
import { QuestionOption } from '../masters/questions/question_option.entity';
import { BaseService } from './base/base.service';
import {
  buildStandardRelations,
  STANDARD_MODULE_RELATIONS,
} from './constants/standard.constants';
import {
  StandardErrorCode,
  StandardException,
} from './exceptions/standard.exception';
import { StandardRepository } from './repositories/standard.repository';
import { Standard } from './standard.entity';
import { StandardIndicator } from './standard_indicators/standard_indicator.entity';
import { StandardModule } from './standard_modules/standard_module.entity';
import { GroupQuestions } from './standard_questions/group_questions/group_question.entity';
import { QuestionRules } from './standard_questions/question_sequences/question_rules/question_rule.entity';
import { QuestionSequences } from './standard_questions/question_sequences/question_sequence.entity';
import { StandardMixedQuestions } from './standard_questions/standard_mixed_questions/standard_mixed_question.entity';
import { StandardQuestion } from './standard_questions/standard_question.entity';
import { StandardQuestionOption } from './standard_questions/standard_question_options/standard_question_option.entity';
import { SubIndicator } from '../masters/sub-indicators/sub-indicator.entity';
import { GroupQuestionSequences } from './standard_questions/group_questions/group_question_sequence.entity';

// interface StandardQueryParams {
//   limit: number;
//   skip: number;
//   sort: any;
//   filter: {
//     search?: string;
//     is_deleted?: boolean;
//     [key: string]: any;
//   };
//   page: number;
//   relations?: string[];
// }

@Injectable()
export class StandardService extends BaseService {
  constructor(
    private readonly standardRepository: StandardRepository,
    private readonly fileService: FileService,
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    @InjectRepository(Standard)
    private readonly standardModel: Repository<Standard>,
  ) {
    super(dataSource);
  }

  async getAllStandards(params: any) {
    try {
      const { limit, page, skip, sort, filter } = params;

      const whereCondition: any = {
        is_deleted: filter.is_deleted !== undefined ? filter.is_deleted : false,
      };

      // For list views, we don't need all the deep relations - just basic info
      const query = {
        take: limit,
        skip,
        order: sort,
        where: whereCondition,
        // Only load essential relations for list view
        relations: [
          'standard_modules',
          'standard_modules.master_module',
          'standard_modules.standard_indicators',
        ],
        // Select only needed fields to reduce data transfer
        select: {
          id: true,
          name: true,
          description: true,
          is_active: true,
          is_deleted: true,
          createdAt: true,
          updatedAt: true,
        },
      };

      if (filter.search) {
        query.where = {
          ...query.where,
          name: ILike(`%${filter.search}%`),
        };
      }

      const [data, totalCount] =
        await this.standardRepository.findAllWithRelations({
          take: limit,
          skip,
          order: sort,
          where: query.where,
        });

      return {
        success: true,
        standards: data,
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

  async createStandard(body: StandardDto, file: any) {
    return this.executeInTransaction(async (queryRunner) => {
      const existingStandard = await this.standardRepository.findByName(
        body.name,
      );

      if (existingStandard) {
        throw new StandardException(
          'Standard already exists',
          StandardErrorCode.DUPLICATE_ENTRY,
        );
      }

      const logo = await this.fileService.standardUploadLogo(file);
      const standard = await this.standardRepository.create({
        name: body.name,
        description: body.description,
        logo_url: logo.url,
      });

      return {
        success: true,
        message: 'Standard created successfully',
        standard,
      };
    });
  }

  private async findStandardById(id: string): Promise<Standard> {
    const queryBuilder = this.dataSource.manager.createQueryBuilder(
      Standard,
      'standard',
    );

    const standardWithRelations = buildStandardRelations(queryBuilder, id);
    const standard = await standardWithRelations.getOne();

    // const standard = await this.standardRepository.findById(id, [
    //   'standard_modules',
    //   'standard_modules.standard_indicators',
    //   'standard_modules.standard_indicators.master_indicator',
    // ]);
    if (!standard || standard?.is_deleted) {
      throw new BadRequestException('Standard not found');
    }
    return standard;
  }

  async getStandardById(
    standardId: string,
    flag: string,
    page = 1,
    limit = 10,
  ) {
    const querryRunner = this.dataSource.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();
    const offset = (page - 1) * limit;
    try {
      // Use a more efficient approach with explicit relations and better filtering
      let standard;
      if (flag === 'edit') {
        // First get the standard without modules
        standard = await querryRunner.manager
          .createQueryBuilder(Standard, 'standard')
          .where('standard.id = :standardId', { standardId })
          .andWhere('standard.is_deleted = false')
          .select([
            'standard.id',
            'standard.name',
            'standard.description',
            'standard.logo_url',
            'standard.is_active',
            'standard.createdAt',
            'standard.updatedAt',
          ])
          .getOne();

        if (!standard) {
          throw new StandardException(
            'Standard not found',
            StandardErrorCode.STANDARD_NOT_FOUND,
          );
        }

        // Then get paginated modules separately
        const modules = await querryRunner.manager
          .createQueryBuilder(StandardModule, 'standard_modules')
          .leftJoinAndSelect(
            'standard_modules.standard_indicators',
            'standard_indicators',
            'standard_indicators.is_deleted = false',
          )
          .where('standard_modules.standard_id = :standardId', { standardId })
          .andWhere('standard_modules.is_deleted = false')
          .select([
            'standard_modules.id',
            'standard_modules.name',
            'standard_modules.sequence',
            // 'standard_modules.description',
            'standard_indicators.id',
            'standard_indicators.name',
            // 'standard_indicators.description',
          ])
          .orderBy('standard_modules.sequence', 'ASC')
          .skip(offset)
          .take(limit)
          .getMany();

        // Get total count for pagination metadata
        const totalModules = await querryRunner.manager
          .createQueryBuilder(StandardModule, 'standard_modules')
          .where('standard_modules.standard_id = :standardId', { standardId })
          .andWhere('standard_modules.is_deleted = false')
          .getCount();

        // Attach modules to standard
        standard.standard_modules = modules;

        return {
          success: true,
          standard,
          meta: {
            currentPage: page,
            currentLimit: limit,
            currentCount: modules.length,
            totalCount: totalModules,
            totalPages: Math.ceil(totalModules / limit),
          },
        };
      }
      if (flag === 'link_modules') {
        // First get the standard without modules
        standard = await querryRunner.manager
          .createQueryBuilder(Standard, 'standard')
          .where('standard.id = :standardId', { standardId })
          .andWhere('standard.is_deleted = false')
          .select(['standard.id', 'standard.is_active', 'standard.name'])
          .getOne();

        if (!standard) {
          throw new StandardException(
            'Standard not found',
            StandardErrorCode.STANDARD_NOT_FOUND,
          );
        }

        // Then get paginated modules with all relations
        const modules = await querryRunner.manager
          .createQueryBuilder(StandardModule, 'standard_modules')
          .leftJoinAndSelect(
            'standard_modules.master_module',
            'master_module',
            'master_module.is_deleted = false',
          )
          .leftJoinAndSelect(
            'standard_modules.standard_indicators',
            'standard_indicators',
            'standard_indicators.is_deleted = false',
          )
          .leftJoinAndSelect(
            'standard_indicators.master_indicator',
            'master_indicator',
            'master_indicator.is_deleted = false',
          )
          .leftJoinAndSelect(
            'standard_indicators.standard_questions',
            'standard_questions',
            'standard_questions.is_deleted = false',
          )
          .leftJoinAndSelect(
            'standard_questions.sub_indicator_id',
            'sub_indicator_id',
            'sub_indicator_id.is_deleted = false',
          )
          .leftJoinAndSelect(
            'standard_questions.master_question',
            'master_question',
            'master_question.is_deleted = false',
          )
          .leftJoinAndSelect(
            'standard_indicators.question_sequences',
            'question_sequences',
            'question_sequences.is_deleted = false',
          )
          .leftJoinAndSelect(
            'question_sequences.standard_question_id',
            'sequence_standard_question',
            'sequence_standard_question.is_deleted = false',
          )
          .leftJoinAndSelect(
            'sequence_standard_question.sub_indicator_id',
            'sequence_sub_indicator',
            'sequence_sub_indicator.is_deleted = false',
          )
          .leftJoinAndSelect(
            'sequence_standard_question.master_question',
            'sequence_master_question',
            'sequence_master_question.is_deleted = false',
          )
          .leftJoinAndSelect(
            'question_sequences.group_questions',
            'group_questions',
            'group_questions.is_deleted = false',
          )
          .leftJoinAndSelect(
            'group_questions.group_question_sequences',
            'group_question_sequences',
            'group_question_sequences.is_deleted = false',
          )
          .leftJoinAndSelect(
            'group_question_sequences.standard_question',
            'group_standard_question',
            'group_standard_question.is_deleted = false',
          )
          .leftJoinAndSelect(
            'question_sequences.question_rules',
            'question_rules',
            'question_rules.is_deleted = false',
          )
          .where('standard_modules.standard_id = :standardId', { standardId })
          .andWhere('standard_modules.is_deleted = false')
          .select([
            'standard_modules.id',
            'standard_modules.name',
            'standard_modules.sequence',
            'standard_indicators.id',
            'standard_indicators.name',
            'standard_indicators.sequence',
            'standard_questions.id',
            'standard_questions.title',
            // 'standard_questions.description',
            'standard_questions.question_type',
            // 'standard_questions.placeholder',
            'standard_questions.is_added_sequence',
            // 'standard_questions.universal_question_id',
            'sub_indicator_id.id',
            'sub_indicator_id.name',
            'master_question.id',
            'master_question.title',
            'question_sequences.id',
            'question_sequences.sequence',
            // 'question_sequences.is_dependent',
            'question_sequences.questable_type',
            'sequence_standard_question.id',
            'sequence_standard_question.title',
            // 'sequence_standard_question.description',
            'sequence_standard_question.question_type',
            // 'sequence_standard_question.placeholder',
            'sequence_standard_question.is_added_sequence',
            // 'sequence_standard_question.universal_question_id',
            // 'sequence_standard_question.option_type',
            'sequence_sub_indicator.id',
            'sequence_sub_indicator.name',
            'sequence_master_question.id',
            'group_questions.id',
            'group_question_sequences.id',
            'group_standard_question.id',
            'group_standard_question.title',
            'group_standard_question.is_added_sequence',
            'master_indicator.id',
            'master_indicator.name',
            // 'master_indicator.description',
            'master_module.id',
            'master_module.name',
            // 'master_module.description',
          ])
          .orderBy('standard_modules.sequence', 'ASC')
          .skip(offset)
          .take(limit)
          .getMany();

        // Get total count for pagination metadata
        const totalModules = await querryRunner.manager
          .createQueryBuilder(StandardModule, 'standard_modules')
          .where('standard_modules.standard_id = :standardId', { standardId })
          .andWhere('standard_modules.is_deleted = false')
          .getCount();

        // Attach modules to standard
        standard.standard_modules = modules;

        return {
          success: true,
          standard,
          meta: {
            currentPage: page,
            currentLimit: limit,
            currentCount: modules.length,
            totalCount: totalModules,
            totalPages: Math.ceil(totalModules / limit),
          },
        };
      }
      if (flag === 'link_questions') {
        // First get the standard without modules
        standard = await querryRunner.manager
          .createQueryBuilder(Standard, 'standard')
          .where('standard.id = :standardId', { standardId })
          .andWhere('standard.is_deleted = false')
          .select(['standard.id', 'standard.is_active', 'standard.name'])
          .getOne();

        if (!standard) {
          throw new StandardException(
            'Standard not found',
            StandardErrorCode.STANDARD_NOT_FOUND,
          );
        }

        // Then get paginated modules with all relations
        const modules = await querryRunner.manager
          .getRepository(StandardModule)
          .createQueryBuilder('standard_modules')
          .leftJoinAndSelect(
            'standard_modules.standard_indicators',
            'standard_indicators',
            'standard_indicators.is_deleted = false',
          )
          // .leftJoinAndSelect(
          //   'standard_indicators.standard_questions',
          //   'standard_questions',
          //   'standard_questions.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'standard_questions.sub_indicator_id',
          //   'sub_indicator_id',
          // )
          // .leftJoinAndSelect(
          //   'standard_questions.standard_question_options',
          //   'standard_question_options',
          //   'standard_question_options.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'standard_questions.master_question',
          //   'master_question',
          // )
          // .leftJoinAndSelect(
          //   'standard_indicators.question_sequences',
          //   'question_sequences',
          //   'question_sequences.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'question_sequences.standard_question_id',
          //   'sequence_standard_question',
          //   'sequence_standard_question.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'sequence_standard_question.sub_indicator_id',
          //   'sequence_sub_indicator',
          // )
          // .leftJoinAndSelect(
          //   'sequence_standard_question.standard_question_options',
          //   'sequence_standard_question_options',
          //   'sequence_standard_question_options.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'sequence_standard_question.master_question',
          //   'sequence_master_question',
          // )
          // .leftJoinAndSelect(
          //   'question_sequences.group_questions',
          //   'group_questions',
          //   'group_questions.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'group_questions.group_question_sequences',
          //   'group_question_sequences',
          //   'group_question_sequences.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'group_question_sequences.standard_question',
          //   'group_standard_question',
          //   'group_standard_question.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'group_standard_question.sub_indicator_id',
          //   'group_sub_indicator',
          // )
          // .leftJoinAndSelect(
          //   'group_standard_question.standard_question_options',
          //   'group_standard_question_options',
          //   'group_standard_question_options.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'question_sequences.question_rules',
          //   'question_rules',
          //   'question_rules.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'question_rules.dependent_question_sequence_id',
          //   'dependent_question_sequence',
          //   'dependent_question_sequence.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'dependent_question_sequence.standard_question_id',
          //   'dependent_standard_question',
          //   'dependent_standard_question.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'dependent_standard_question.sub_indicator_id',
          //   'dependent_sub_indicator',
          // )
          // .leftJoinAndSelect(
          //   'question_rules.parent_question_id',
          //   'parent_question_id',
          //   'parent_question_id.is_deleted = false',
          // )
          // .leftJoinAndSelect(
          //   'question_rules.parent_option_id',
          //   'parent_option_id',
          //   'parent_option_id.is_deleted = false',
          // )
          .leftJoinAndSelect(
            'standard_indicators.master_indicator',
            'master_indicator',
          )
          .leftJoinAndSelect('standard_modules.master_module', 'master_module')
          .where('standard_modules.standard_id = :standardId', { standardId })
          .andWhere('standard_modules.is_deleted = false')
          .select([
            'standard_modules.id',
            'standard_modules.name',
            'standard_modules.sequence',
            'standard_indicators.id',
            'standard_indicators.name',
            'standard_indicators.sequence',
            // 'standard_questions.id',
            // 'standard_questions.title',
            // 'standard_questions.question_type',
            // 'standard_questions.is_added_sequence',
            // 'standard_questions.universal_question_id',
            // 'standard_questions.option_type',
            // 'sub_indicator_id.id',
            // 'sub_indicator_id.name',
            // 'standard_question_options.id',
            // 'standard_question_options.text',
            // 'standard_question_options.value',
            // 'master_question.id',
            // 'master_question.title',
            // 'question_sequences.id',
            // 'question_sequences.sequence',
            // 'question_sequences.questable_type',
            // 'sequence_standard_question.id',
            // 'sequence_standard_question.title',
            // 'sequence_standard_question.question_type',
            // 'sequence_standard_question.placeholder',
            // 'sequence_standard_question.is_added_sequence',
            // 'sequence_standard_question.option_type',
            // 'sequence_standard_question.universal_question_id',
            // 'sequence_sub_indicator.id',
            // 'sequence_sub_indicator.name',
            // 'sequence_standard_question_options.id',
            // 'sequence_standard_question_options.text',
            // 'sequence_standard_question_options.value',
            // 'sequence_master_question.id',
            // 'group_questions.id',
            // 'group_questions.name',
            // 'group_question_sequences.id',
            // 'group_standard_question.id',
            // 'group_standard_question.title',
            // 'group_standard_question.question_type',
            // 'group_standard_question.is_added_sequence',
            // 'group_sub_indicator.name',
            // 'group_standard_question_options.id',
            // 'group_standard_question_options.text',
            // 'group_standard_question_options.value',
            // 'question_rules.id',
            // 'dependent_question_sequence.id',
            // 'dependent_question_sequence.sequence',
            // 'dependent_standard_question.id',
            // 'dependent_standard_question.title',
            // 'dependent_standard_question.question_type',
            // 'dependent_standard_question.is_added_sequence',
            // 'dependent_standard_question.universal_question_id',
            // 'dependent_sub_indicator.id',
            // 'dependent_sub_indicator.name',
            // 'parent_question_id.id',
            // 'parent_option_id.id',
            'master_indicator.id',
            'master_indicator.name',
            // 'master_indicator.description',
            'master_module.id',
            'master_module.name',
          ])
          .orderBy('standard_modules.sequence', 'ASC')
          .skip(offset)
          .take(limit)
          .getMany();

        // Get total count for pagination metadata
        const totalModules = await querryRunner.manager
          .createQueryBuilder(StandardModule, 'standard_modules')
          .where('standard_modules.standard_id = :standardId', { standardId })
          .andWhere('standard_modules.is_deleted = false')
          .getCount();

        // Attach modules to standard
        standard.standard_modules = modules;

        return {
          success: true,
          standard,
          meta: {
            currentPage: page,
            currentLimit: limit,
            currentCount: modules.length,
            totalCount: totalModules,
            totalPages: Math.ceil(totalModules / limit),
          },
        };
      }
      if (flag === 'edit_link_modules') {
        // Fetch the standard
        const standard = await querryRunner.manager.findOne(Standard, {
          where: { id: standardId, is_deleted: false },
          select: ['id', 'name'],
        });

        if (!standard) {
          throw new StandardException(
            `Standard with ID ${standardId} not found`,
            StandardErrorCode.STANDARD_NOT_FOUND,
          );
        }

        // Fetch modules with indicators & questions
        const masterModules = await querryRunner.manager
          .createQueryBuilder(Module, 'm')
          .leftJoinAndSelect('m.indicators', 'ind')
          .leftJoinAndSelect('ind.questions', 'q')
          .leftJoinAndSelect('q.sub_indicator', 'sub_indicator')
          .leftJoinAndMapOne(
            'm.standard_module',
            StandardModule,
            'sm',
            'sm.master_module_id = m.id AND sm.standard_id = :standardId AND sm.is_deleted = false',
            { standardId },
          )
          .leftJoinAndMapOne(
            'ind.standard_indicator',
            StandardIndicator,
            'si',
            'si.master_indicator_id = ind.id AND si.standard_modules_id = sm.id AND si.is_deleted = false',
          )
          .leftJoinAndMapOne(
            'q.standard_question',
            StandardQuestion,
            'sq',
            'sq.master_question_id = q.id AND sq.standard_indicator_id = si.id AND sq.is_deleted = false',
          )
          .leftJoinAndMapMany(
            'sq.question_sequences',
            QuestionSequences,
            'qs',
            'qs.standard_question_id = sq.id AND qs.is_deleted = false',
          )
          .orderBy('sm.sequence', 'ASC')
          .addOrderBy('si.sequence', 'ASC')
          .addOrderBy('qs.sequence', 'ASC')
          .getMany();

        // Helper: move unchecked items to the end
        const orderAndSort = <
          T extends { checked?: boolean; sequence?: number },
        >(
          arr: T[],
        ) =>
          [...arr]
            .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
            .sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? -1 : 1));

        // Transform to frontend structure
        // Cast modules to type with optional checked/sequence
        const transformed = orderAndSort(
          masterModules as (Module & {
            isChecked?: boolean;
            sequence?: number;
          })[],
        ).map((mod) => {
          const m = mod as Module & { standard_module?: StandardModule };
          return {
            id: m.id,
            master_mod_id: m.id,
            name: m.name,
            isChecked: !!m.standard_module,
            sequence: m.standard_module?.sequence ?? null,
            indicators: orderAndSort(
              m.indicators.map((ind) => {
                const i = ind as Indicator & {
                  standard_indicator?: StandardIndicator;
                };
                return {
                  id: i.id,
                  master_ind_id: i.id,
                  name: i.name,
                  isChecked: !!i.standard_indicator,
                  sequence: i.standard_indicator?.sequence ?? null,
                  questions: orderAndSort(
                    i.questions.map((q) => {
                      const question = q as Question & {
                        standard_question?: StandardQuestion & {
                          question_sequences?: QuestionSequences[];
                        };
                        sub_indicator?: SubIndicator;
                      };
                      return {
                        id: question.id,
                        master_ques_id: question.id,
                        title: question.title,
                        question_type: question.question_type,
                        isChecked: !!question.standard_question,
                        sequence:
                          question.standard_question?.question_sequences?.[0]
                            ?.sequence ?? null,
                        sub_indicator_name:
                          question?.sub_indicator?.name ?? null,
                      };
                    }),
                  ),
                };
              }),
            ),
          };
        });

        return {
          success: true,
          standard,
          modules: transformed,
        };
      }
    } catch (error) {
      await querryRunner.rollbackTransaction();
      throw new StandardException(
        error.message,
        StandardErrorCode.INVALID_INPUT,
      );
    } finally {
      await querryRunner.release();
    }
  }

  async _getStandardById(standardId: string) {
    const querryRunner = this.dataSource.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();
    try {
      const standard = await querryRunner.manager.findOne(Standard, {
        where: { id: standardId },
        relations: [
          'standard_modules',
          'standard_modules.master_module',
          'standard_modules.standard_indicators',
          'standard_modules.standard_indicators.master_indicator',
          'standard_modules.standard_indicators.question_sequences.standard_question_id',
          'standard_modules.standard_indicators.question_sequences.standard_question_id.sub_indicator_id',
          'standard_modules.standard_indicators.question_sequences.standard_question_id.master_question',
        ],
      });
      if (!standard) {
        throw new StandardException(
          'Standard not found',
          StandardErrorCode.STANDARD_NOT_FOUND,
        );
      }
      await querryRunner.commitTransaction();
      return { success: true, standard };
    } catch (error) {
      await querryRunner.rollbackTransaction();
      if (error instanceof StandardException) {
        throw error;
      }
      throw new StandardException(
        error.message,
        StandardErrorCode.INVALID_INPUT,
      );
    } finally {
      await querryRunner.release();
    }
  }

  async getStandardModuleById(standardId: string, moduleId: string) {
    const querryRunner = this.dataSource.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();
    try {
      const standardModule = await querryRunner.manager
        .createQueryBuilder(StandardModule, 'standard_modules')
        .leftJoinAndSelect(
          'standard_modules.standard_indicators',
          'standard_indicators',
          'standard_indicators.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_indicators.master_indicator',
          'master_indicator',
          'master_indicator.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_indicators.standard_questions',
          'standard_questions',
          'standard_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_questions.sub_indicator_id',
          'sub_indicator',
          'sub_indicator.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_indicators.question_sequences',
          'question_sequences',
          'question_sequences.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.standard_question_id',
          'standard_question',
          'standard_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.standard_question_options',
          'standard_question_options',
          'standard_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.mixed_questions',
          'mixed_questions',
          'mixed_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.question_rules',
          'question_rules',
          'question_rules.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_rules.dependent_question_sequence_id',
          'dependent_question_sequence',
          'dependent_question_sequence.is_deleted = false',
        )
        .leftJoinAndSelect(
          'dependent_question_sequence.standard_question_id',
          'dependent_standard_question',
          'dependent_standard_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_rules.parent_question_id',
          'parent_question_id',
          'parent_question_id.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_rules.parent_option_id',
          'parent_option_id',
          'parent_option_id.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.group_questions',
          'group_questions',
          'group_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_questions.group_question_sequences',
          'group_question_sequences',
          'group_question_sequences.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_question_sequences.standard_question',
          'group_standard_question',
          'group_standard_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_standard_question.standard_question_options',
          'group_standard_question_options',
          'group_standard_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_standard_question.master_question',
          'group_master_question',
          'group_master_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.master_question',
          'master_question',
          'master_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.sub_indicator_id',
          'sub_indicators',
          'sub_indicators.is_deleted = false',
        )
        .where('standard_modules.id = :moduleId', { moduleId })
        .andWhere('standard_modules.is_deleted = false')
        .getOne();

      if (!standardModule) {
        throw new StandardException(
          'Standard module not found',
          StandardErrorCode.STANDARD_NOT_FOUND,
        );
      }

      await querryRunner.commitTransaction();
      return { success: true, standardModule };
    } catch (error) {
      await querryRunner.rollbackTransaction();
      if (error instanceof StandardException) {
        throw error;
      }
      throw new StandardException(
        error.message,
        StandardErrorCode.INVALID_INPUT,
      );
    } finally {
      await querryRunner.release();
    }
  }

  async _getStandardByIdWithQuestions(indicatorId: string) {
    const querryRunner = this.dataSource.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();
    try {
      const standardIndicator = await querryRunner.manager
        .createQueryBuilder(StandardIndicator, 'standardIndicator')
        .leftJoinAndSelect(
          'standardIndicator.question_sequences',
          'question_sequences',
          'question_sequences.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.standard_question_id',
          'standard_question',
          'standard_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.sub_indicator_id',
          'sub_indicator',
          'sub_indicator.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.master_question',
          'master_question',
          'master_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.standard_question_options',
          'standard_question_options',
          'standard_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_question.mixed_questions',
          'mixed_questions',
          'mixed_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.question_rules',
          'question_rules',
          'question_rules.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_rules.dependent_question_sequence_id',
          'dependent_question_sequence',
          'dependent_question_sequence.is_deleted = false',
        )
        .leftJoinAndSelect(
          'dependent_question_sequence.standard_question_id',
          'dependent_standard_question',
          'dependent_standard_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'dependent_standard_question.sub_indicator_id',
          'dependent_sub_indicator',
        )
        .leftJoinAndSelect(
          'question_rules.parent_question_id',
          'parent_question_id',
          'parent_question_id.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_rules.parent_option_id',
          'parent_option_id',
          'parent_option_id.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.group_questions',
          'group_questions',
          'group_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_questions.group_question_sequences',
          'group_question_sequences',
          'group_question_sequences.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_question_sequences.standard_question',
          'group_standard_question',
          'group_standard_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_standard_question.sub_indicator_id',
          'group_sub_indicator',
        )
        .leftJoinAndSelect(
          'group_standard_question.standard_question_options',
          'group_standard_question_options',
          'group_standard_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_standard_question.master_question',
          'group_master_question',
          'group_master_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standardIndicator.standard_questions',
          'standard_questions',
          'standard_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_questions.standard_question_options',
          'standard_questions_options',
          'standard_questions_options.is_deleted = false',
        )
        // .leftJoinAndSelect(
        //   'standard_questions.standard_mixed_questions',
        //   'standard_mixed_questions',
        //   'standard_mixed_questions.is_deleted = false',
        // )
        .leftJoinAndSelect(
          'standard_questions.sub_indicator_id',
          'sub_indicators',
          'sub_indicators.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_questions.master_question',
          'master_questions',
          'master_questions.is_deleted = false',
        )
        .where('standardIndicator.id = :indicatorId', { indicatorId })
        .andWhere('standardIndicator.is_deleted = false')
        .getOne();

      return { success: true, standardIndicator };
    } catch (error) {
      if (error instanceof StandardException) {
        throw error;
      }
      throw new StandardException(
        error.message,
        StandardErrorCode.INVALID_INPUT,
      );
    } finally {
      await querryRunner.release();
    }
  }

  async updateStandardById(standardId: string, params: UpdateStandardDto) {
    const querryRunner = this.dataSource.createQueryRunner();
    await querryRunner.connect();
    await querryRunner.startTransaction();
    try {
      // const standard = await this.standardRepository.findById(standardId);
      const standard = await querryRunner.manager.findOne(Standard, {
        where: { id: standardId },
      });
      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      await querryRunner.manager.update(Standard, standardId, {
        name: params.name,
        description: params.description,
        is_active: params.is_active,
      });

      await querryRunner.commitTransaction();
      return await this.getStandardById(standardId, 'link_modules');
      // return { success: true, message: 'Standard updated successfully' };
    } catch (error) {
      await querryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await querryRunner.release();
    }
  }

  async deleteStandardById(standardId: string) {
    const standard = await this.standardRepository.findById(standardId);
    if (!standard) {
      throw new BadRequestException('Standard not found');
    }

    if (standard.is_deleted) {
      throw new BadRequestException('Standard already deleted');
    }

    await this.standardRepository.update(standardId, {
      deleted_at: new Date(),
      is_deleted: true,
    });

    return {
      success: true,
      message: 'Standard successfully deleted',
    };
  }

  async updateModuleIndicatorSequence(
    standardId: string,
    type: StandardSequenceType,
    items: SequenceItemDto[],
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      const standard = await this.standardRepository.findById(standardId, [
        'standard_modules',
        'standard_modules.standard_indicators',
        'standard_modules.standard_indicators.standard_questions',
        'standard_modules.standard_indicators.question_sequences',
      ]);

      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      const ids = items.map((item) => item.id);

      switch (type) {
        case StandardSequenceType.MODULE:
          await this.updateModuleSequences(queryRunner, standard, ids, items);
          break;
        case StandardSequenceType.INDICATOR:
          await this.updateIndicatorSequences(
            queryRunner,
            standard,
            ids,
            items,
          );
          break;
        case StandardSequenceType.QUESTION_SEQUENCE:
          await this.updateQuestionSequenceSequences(
            queryRunner,
            standard,
            ids,
            items,
          );
          break;
        default:
          throw new BadRequestException('Invalid sequence type');
      }

      return {
        success: true,
        message: 'Sequence updated successfully',
      };
    });
  }

  private async updateModuleSequences(
    queryRunner: QueryRunner,
    standard: Standard,
    ids: string[],
    items: SequenceItemDto[],
  ) {
    const validModuleIds = standard.standard_modules.map((module) => module.id);
    const invalidIds = ids.filter((id) => !validModuleIds.includes(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid module IDs: ${invalidIds.join(', ')}`,
      );
    }

    await queryRunner.manager
      .createQueryBuilder()
      .update(StandardModule)
      .set({
        sequence: () =>
          `CASE id ${items.map((item) => `WHEN '${item.id}' THEN ${item.sequence}`).join(' ')} END`,
      })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  private async updateIndicatorSequences(
    queryRunner: QueryRunner,
    standard: Standard,
    ids: string[],
    items: SequenceItemDto[],
  ) {
    const validIndicatorIds = standard.standard_modules.flatMap((module) =>
      module.standard_indicators.map((indicator) => indicator.id),
    );

    const invalidIds = ids.filter((id) => !validIndicatorIds.includes(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid indicator IDs: ${invalidIds.join(', ')}`,
      );
    }

    await queryRunner.manager
      .createQueryBuilder()
      .update(StandardIndicator)
      .set({
        sequence: () =>
          `CASE id ${items.map((item) => `WHEN '${item.id}' THEN ${item.sequence}`).join(' ')} END`,
      })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  private async updateQuestionSequenceSequences(
    queryRunner: QueryRunner,
    standard: Standard,
    ids: string[],
    items: SequenceItemDto[],
  ) {
    const validQuestionSequenceIds = standard.standard_modules.flatMap(
      (module) =>
        module.standard_indicators.flatMap((indicator) =>
          indicator.question_sequences.map((sequence) => sequence.id),
        ),
    );

    const invalidIds = ids.filter(
      (id) => !validQuestionSequenceIds.includes(id),
    );

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid question sequence IDs: ${invalidIds.join(', ')}`,
      );
    }

    await queryRunner.manager
      .createQueryBuilder()
      .update(QuestionSequences)
      .set({
        sequence: () =>
          `CASE id ${items.map((item) => `WHEN '${item.id}' THEN ${item.sequence}`).join(' ')} END`,
      })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  private async createStandardMixedQuestions(
    queryRunner: QueryRunner,
    standardQuestions: StandardQuestion[],
    masterQuestions: Question[],
  ): Promise<StandardMixedQuestions[]> {
    const standardMixedQuestions: StandardMixedQuestions[] = [];

    standardQuestions.forEach((standardQuestion) => {
      const masterQuestion = masterQuestions.find(
        (q) => q.id === standardQuestion.master_question.id,
      );

      if (
        masterQuestion?.question_type === 'MIXED_TYPE' &&
        masterQuestion.mixed_type_questions?.length
      ) {
        const mixedQuestions = masterQuestion.mixed_type_questions.map(
          (mixedQuestion) => {
            delete standardQuestion.mixed_questions;
            const standardMixedQuestion = new StandardMixedQuestions();
            standardMixedQuestion.value_question_type =
              mixedQuestion.value_question_type;
            standardMixedQuestion.value_name = mixedQuestion.value_name;
            standardMixedQuestion.value_enum = mixedQuestion.value_enum;
            standardMixedQuestion.unit_type = mixedQuestion.unit_type;
            standardMixedQuestion.unit_name = mixedQuestion.unit_name;
            standardMixedQuestion.unit_enum = mixedQuestion.unit_enum;
            standardMixedQuestion.standard_question = standardQuestion;
            return standardMixedQuestion;
          },
        );
        standardMixedQuestions.push(...mixedQuestions);
      }
    });

    // console.info('=================================================');
    // console.info(standardMixedQuestions);
    // console.info('=================================================');

    return queryRunner.manager
      .getRepository(StandardMixedQuestions)
      .save(standardMixedQuestions);
  }

  private async createStandardQuestions(
    queryRunner: QueryRunner,
    standardIndicators: StandardIndicator[],
    masterQuestions: Question[],
  ): Promise<StandardQuestion[]> {
    const standardQuestions: StandardQuestion[] = [];

    // Collect all unique subindicator names from master questions with valid sub_indicators
    // const subIndicatorNames = masterQuestions
    //   .filter(
    //     (q): q is Question & { sub_indicator: SubIndicator } =>
    //       !!q.sub_indicator?.name?.trim(),
    //   )
    //   .map((q) => q.sub_indicator.name);

    // let existingSubIndicators;
    // let existingSubIndicatorsMap;
    // if (subIndicatorNames.length > 0) {
    //   existingSubIndicators = await queryRunner.manager
    //     .getRepository(StandardSubIndicator)
    //     .createQueryBuilder('subIndicator')
    //     .where('subIndicator.name IN (:...names)', { names: subIndicatorNames })
    //     .getMany();

    //   existingSubIndicatorsMap = new Map<string, StandardSubIndicator>(
    //     existingSubIndicators.map((si) => [si.name, si]),
    //   );
    // }

    // Create all standard questions first
    for (const indicator of standardIndicators) {
      for (const masterQuestion of masterQuestions) {
        const standardQuestion = new StandardQuestion();
        standardQuestion.title = masterQuestion.title;
        standardQuestion.description = masterQuestion.description;
        standardQuestion.question_type = masterQuestion.question_type;
        standardQuestion.placeholder = masterQuestion.placeholder;
        standardQuestion.standard_indicator = indicator;
        standardQuestion.master_question = masterQuestion;
        standardQuestion.option_type =
          masterQuestion.question_type !== 'MIXED_TYPE' ? 'GENERAL' : 'MIXED';
        standardQuestion.sub_indicator_id = masterQuestion?.sub_indicator;
        standardQuestion.department = masterQuestion?.department;
        standardQuestion.universal_question_id =
          masterQuestion?.universal_question_id;
        standardQuestion.is_latest_data = masterQuestion.is_latest_data;

        // if (masterQuestion.sub_indicator && masterQuestion.sub_indicator.name) {
        //   let standardSubIndicator = existingSubIndicatorsMap.get(
        //     masterQuestion.sub_indicator.name,
        //   );
        //   if (!standardSubIndicator) {
        //     standardSubIndicator = new StandardSubIndicator();
        //     standardSubIndicator.name = masterQuestion.sub_indicator.name;
        //     standardSubIndicator.description =
        //       masterQuestion.sub_indicator?.description;
        //     standardSubIndicator.is_required =
        //       masterQuestion.sub_indicator?.is_required || false;
        //     subIndicators.push(standardSubIndicator);
        //     existingSubIndicatorsMap.set(
        //       masterQuestion.sub_indicator.name,
        //       standardSubIndicator,
        //     );
        //   }
        //   standardQuestion.standard_sub_indicators = standardSubIndicator;
        // }

        standardQuestions.push(standardQuestion);
      }
    }

    // Save subindicators first
    // await queryRunner.manager
    //   .getRepository(StandardSubIndicator)
    //   .save(subIndicators);

    // Save all standard questions in bulk
    const savedStandardQuestions: StandardQuestion[] = await queryRunner.manager
      .getRepository(StandardQuestion)
      .save(standardQuestions);

    // Create and save mixed type questions if any
    if (masterQuestions.some((q) => q.question_type === 'MIXED_TYPE')) {
      await this.createStandardMixedQuestions(
        queryRunner,
        savedStandardQuestions,
        masterQuestions,
      );
    }

    return savedStandardQuestions;
  }

  private async createStandardQuestionOptions(
    queryRunner: QueryRunner,
    standardQuestions: StandardQuestion[],
    masterQuestions: Question[],
  ): Promise<StandardQuestionOption[]> {
    const standardQuestionOptions: StandardQuestionOption[] = [];

    // Create a map of master questions for quick lookup
    const masterQuestionMap = new Map(masterQuestions.map((q) => [q.id, q]));

    for (const standardQuestion of standardQuestions) {
      const masterQuestion = masterQuestionMap.get(
        standardQuestion.master_question.id,
      );

      if (!masterQuestion) {
        console.warn(
          `Master question not found for standard question ${standardQuestion.id}`,
        );
        continue;
      }

      if (masterQuestion.question_options?.length) {
        const options = masterQuestion.question_options.map((option) => {
          const standardQuesOption = new StandardQuestionOption();
          standardQuesOption.text = option.text;
          standardQuesOption.value = option.value;
          standardQuesOption.standard_question = standardQuestion;
          standardQuesOption.master_option = option;
          return standardQuesOption;
        });
        standardQuestionOptions.push(...options);
      }
    }

    if (standardQuestionOptions.length > 0) {
      return queryRunner.manager
        .getRepository(StandardQuestionOption)
        .save(standardQuestionOptions);
    }

    return [];
  }

  async addModulesIndicatorsQuestionsToStandard_old(
    standardId: string,
    body: AddModulesIndicatorsQuestionsToStandardDto,
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      const modules = body.data?.module || [];
      // Fetch master modules
      const masterModules: Module[] = await queryRunner.manager
        .getRepository(Module)
        .findByIds(modules.map((m) => m.id));

      const masterModuleMap = new Map(masterModules.map((m) => [m.id, m]));

      // Fetch existing standard modules
      const existingStandardModules: StandardModule[] =
        await queryRunner.manager.getRepository(StandardModule).find({
          where: { standard: { id: standardId } },
          relations: ['master_module'],
        });

      const standardModuleMap = new Map(
        existingStandardModules.map((sm) => [sm.master_module.id, sm]),
      );

      for (const mod of modules) {
        const moduleData = masterModuleMap.get(mod.id);
        if (!moduleData) continue;

        let standardModule = standardModuleMap.get(mod.id);
        if (standardModule) {
          // Update existing module
          standardModule.is_deleted = false;
          standardModule.name = moduleData.name;
          standardModule.description = moduleData.description;
          await queryRunner.manager
            .getRepository(StandardModule)
            .save(standardModule);
        } else {
          // Insert new module
          standardModule = await queryRunner.manager
            .getRepository(StandardModule)
            .save({
              name: moduleData.name,
              description: moduleData.description,
              standard: { id: standardId },
              master_module: moduleData,
            });
        }

        for (const ind of mod.indicator || []) {
          const existingIndicators = await queryRunner.manager
            .getRepository(StandardIndicator)
            .find({
              where: {
                master_indicator: { id: ind.id },
                standard_modules: { id: standardModule.id },
              },
              relations: ['master_indicator.questions'],
            });
          let standardIndicator = existingIndicators[0];

          if (standardIndicator) {
            standardIndicator.is_deleted = false;
            await queryRunner.manager
              .getRepository(StandardIndicator)
              .save(standardIndicator);
          } else {
            const indicatorData = await queryRunner.manager
              .getRepository(Indicator)
              .findOne({ where: { id: ind.id }, relations: ['questions'] });
            standardIndicator = await queryRunner.manager
              .getRepository(StandardIndicator)
              .save({
                name: indicatorData.name,
                description: indicatorData.description,
                standard_modules: standardModule,
                master_indicator: indicatorData,
              });
          }

          for (const q of standardIndicator.master_indicator.questions || []) {
            const existingQuestions = await queryRunner.manager
              .getRepository(StandardQuestion)
              .find({
                where: {
                  master_question: { id: q.id },
                  standard_indicator: { id: standardIndicator.id },
                },
              });
            let standardQuestion = existingQuestions[0];

            if (standardQuestion) {
              standardQuestion.is_deleted = false;
              await queryRunner.manager
                .getRepository(StandardQuestion)
                .save(standardQuestion);
            } else {
              standardQuestion = await queryRunner.manager
                .getRepository(StandardQuestion)
                .save({
                  title: q.title,
                  description: q.description,
                  option_type:
                    q.question_type == 'MIXED_TYPE' ? 'MIXED' : 'GENERAL',
                  question_type: q.question_type,
                  placeholder: q.placeholder,
                  standard_indicator: standardIndicator,
                  master_question: q,
                  universal_question_id: q.universal_question_id,
                  is_added_sequence: true,
                  is_latest_data: q.is_latest_data,
                });
            }
          }
        }
      }

      return {
        success: true,
        message: 'Modules, indicators, and questions processed successfully',
      };
    });
  }

  async addModulesIndicatorsQuestionsToStandard(
    standardId: string,
    body: AddModulesIndicatorsQuestionsToStandardDto,
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      const modulesPayload = body.data?.module || [];

      // 1️⃣ Fetch current DB state
      const existingModules: StandardModule[] = await queryRunner.manager
        .getRepository(StandardModule)
        .find({
          where: { standard: { id: standardId }, is_deleted: false },
          relations: [
            'master_module',
            'standard_indicators',
            'standard_indicators.master_indicator',
            'standard_indicators.standard_questions',
          ],
        });

      const findById = <T extends { id: string }>(list: T[], id: string) =>
        list.find((item) => item.id === id);

      // 2️⃣ Process Modules
      for (
        let moduleIndex = 0;
        moduleIndex < modulesPayload.length;
        moduleIndex++
      ) {
        const modPayload = modulesPayload[moduleIndex];

        let standardModule: StandardModule | undefined = findById(
          existingModules,
          modPayload.id,
        );

        // Fetch master module
        const masterModule: Module | null = await queryRunner.manager
          .getRepository(Module)
          .findOne({ where: { id: modPayload.id } });
        if (!masterModule)
          throw new BadRequestException(`Module not found: ${modPayload.id}`);

        if (!standardModule) {
          // Add new module
          standardModule = await queryRunner.manager
            .getRepository(StandardModule)
            .save({
              name: masterModule.name,
              description: masterModule.description,
              sequence: moduleIndex + 1,
              standard: { id: standardId },
              master_module: masterModule,
            });
        } else {
          // Update existing module
          standardModule.sequence = moduleIndex + 1;
          standardModule.name = masterModule.name;
          standardModule.description = masterModule.description;
          await queryRunner.manager
            .getRepository(StandardModule)
            .save(standardModule);
        }

        // 3️⃣ Sync Indicators
        const existingIndicators: StandardIndicator[] =
          standardModule.standard_indicators || [];
        const indicatorsPayload = modPayload.indicator || [];

        for (
          let indIndex = 0;
          indIndex < indicatorsPayload.length;
          indIndex++
        ) {
          const indPayload = indicatorsPayload[indIndex];

          let standardIndicator: StandardIndicator | undefined = findById(
            existingIndicators,
            indPayload.id,
          );

          // Fetch master indicator
          const masterIndicator: Indicator | null = await queryRunner.manager
            .getRepository(Indicator)
            .findOne({
              where: { id: indPayload.id },
              relations: ['questions', 'questions.sub_indicator'],
            });
          if (!masterIndicator)
            throw new BadRequestException(
              `Indicator not found: ${indPayload.id}`,
            );

          if (!standardIndicator) {
            standardIndicator = await queryRunner.manager
              .getRepository(StandardIndicator)
              .save({
                name: masterIndicator.name,
                description: masterIndicator.description,
                sequence: indIndex + 1,
                standard_modules: standardModule,
                master_indicator: masterIndicator,
              });
          } else {
            standardIndicator.name = masterIndicator.name;
            standardIndicator.description = masterIndicator.description;
            standardIndicator.sequence = indIndex + 1;
            await queryRunner.manager
              .getRepository(StandardIndicator)
              .save(standardIndicator);
          }

          // 4️⃣ Sync Questions
          const existingQuestions: StandardQuestion[] =
            standardIndicator.standard_questions || [];
          const questionsPayload = indPayload.question || [];

          for (let qIndex = 0; qIndex < questionsPayload.length; qIndex++) {
            const qId = questionsPayload[qIndex];
            let standardQuestion: StandardQuestion | undefined = findById(
              existingQuestions,
              qId,
            );

            // Fetch master question
            const masterQuestion: Question | null = await queryRunner.manager
              .getRepository(Question)
              .findOne({
                where: { id: qId },
                relations: [
                  'question_options',
                  'mixed_type_questions',
                  'sub_indicator',
                  'department',
                ],
              });
            if (!masterQuestion)
              throw new BadRequestException(`Question not found: ${qId}`);

            if (!standardQuestion) {
              standardQuestion = await queryRunner.manager
                .getRepository(StandardQuestion)
                .save({
                  title: masterQuestion.title,
                  description: masterQuestion.description,
                  question_type: masterQuestion.question_type,
                  placeholder: masterQuestion.placeholder,
                  option_type:
                    masterQuestion.question_type !== 'MIXED_TYPE'
                      ? 'GENERAL'
                      : 'MIXED',
                  standard_indicator: standardIndicator,
                  master_question: masterQuestion,
                  sub_indicator_id: masterQuestion?.sub_indicator?.id,
                  department: masterQuestion?.department?.id,
                  is_added_sequence: true,
                  universal_question_id: masterQuestion.universal_question_id,
                  is_latest_data: masterQuestion.is_latest_data,
                });
            } else {
              standardQuestion.title = masterQuestion.title;
              standardQuestion.description = masterQuestion.description;
              standardQuestion.question_type = masterQuestion.question_type;
              standardQuestion.placeholder = masterQuestion.placeholder;
              standardQuestion.option_type =
                masterQuestion.question_type !== 'MIXED_TYPE'
                  ? 'GENERAL'
                  : 'MIXED';
              standardQuestion.is_added_sequence = true;
              standardQuestion.is_latest_data = masterQuestion.is_latest_data;
              await queryRunner.manager
                .getRepository(StandardQuestion)
                .save(standardQuestion);
            }

            // 5️⃣ Sync QuestionSequences
            const existingSequence = await queryRunner.manager
              .getRepository(QuestionSequences)
              .findOne({
                where: {
                  standard_question_id: { id: standardQuestion.id },
                  standard_indicators: { id: standardIndicator.id },
                },
              });

            if (!existingSequence) {
              await queryRunner.manager.getRepository(QuestionSequences).save({
                sequence: qIndex + 1,
                is_dependent: false,
                questable_type: QuestableType.STANDARD,
                standard_question_id: standardQuestion.id,
                standard_indicators: standardIndicator.id,
                universal_question_id: masterQuestion.universal_question_id,
              });
            } else {
              existingSequence.sequence = qIndex + 1;
              await queryRunner.manager
                .getRepository(QuestionSequences)
                .save(existingSequence);
            }
          }

          // 6️⃣ Remove Questions not in payload
          const questionsToDelete = existingQuestions.filter(
            (q) => !questionsPayload.includes(q.master_question.id),
          );
          if (questionsToDelete.length > 0) {
            await queryRunner.manager
              .getRepository(StandardQuestion)
              .softDelete(questionsToDelete.map((q) => q.id));
          }
        }

        // 7️⃣ Remove Indicators not in payload
        const indicatorIdsPayload = indicatorsPayload.map((i) => i.id);
        const indicatorsToDelete = existingIndicators.filter(
          (i) => !indicatorIdsPayload.includes(i.master_indicator.id),
        );
        if (indicatorsToDelete.length > 0) {
          await queryRunner.manager
            .getRepository(StandardIndicator)
            .softDelete(indicatorsToDelete.map((i) => i.id));
        }
      }

      // 8️⃣ Remove Modules not in payload
      const moduleIdsPayload = modulesPayload.map((m) => m.id);
      const modulesToDelete = existingModules.filter(
        (m) => !moduleIdsPayload.includes(m.master_module.id),
      );
      if (modulesToDelete.length > 0) {
        await queryRunner.manager
          .getRepository(StandardModule)
          .softDelete(modulesToDelete.map((m) => m.id));
      }

      return {
        success: true,
        message:
          'Modules, indicators, questions, and sequences synchronized successfully',
      };
    });
  }

  // async addModulesIndicatorsQuestionsToStandardOne(
  //   standardId: string,
  //   sequence: number,
  //   body: AddModulesIndicatorsQuestionsToStandardDto_opt,
  // ) {
  //   const modulesPayload = body.data?.module || [];
  //   if (!modulesPayload.length) {
  //     throw new BadRequestException('Module payload is required');
  //   }

  //   const results = [];

  //   for (let mIndex = 0; mIndex < modulesPayload.length; mIndex++) {
  //     const modulePayload = modulesPayload[mIndex];

  //     const result = await this.executeInTransaction(async (queryRunner) => {
  //       let existingModule = await queryRunner.manager
  //         .getRepository(StandardModule)
  //         .findOne({
  //           where: {
  //             standard: { id: standardId },
  //             master_module: { id: modulePayload.id },
  //             is_deleted: false,
  //           },
  //           relations: [
  //             'standard_indicators',
  //             'standard_indicators.standard_questions.standard_question_options',
  //             'standard_indicators.standard_questions.mixed_questions',
  //             'standard_indicators.standard_questions.sub_indicator_id',
  //             'standard_indicators.standard_questions.department',
  //           ],
  //         });

  //       if (!modulePayload.checked) {
  //         if (existingModule) {
  //           existingModule.is_deleted = true;
  //           existingModule.deleted_at = new Date();
  //           await queryRunner.manager
  //             .getRepository(StandardModule)
  //             .save(existingModule);
  //         }
  //         return {
  //           success: true,
  //           message: 'Module soft-deleted',
  //           moduleId: modulePayload.id,
  //         };
  //       }

  //       if (!existingModule) {
  //         const masterModule = await queryRunner.manager
  //           .getRepository(Module)
  //           .findOne({
  //             where: { id: modulePayload.id },
  //           });
  //         if (!masterModule)
  //           throw new BadRequestException(
  //             `Master Module not found: ${modulePayload.id}`,
  //           );

  //         const newModule = queryRunner.manager
  //           .getRepository(StandardModule)
  //           .create({
  //             name: masterModule.name,
  //             description: masterModule.description,
  //             sequence: sequence, // module sequence
  //             standard: { id: standardId },
  //             master_module: masterModule,
  //           });

  //         existingModule = await queryRunner.manager
  //           .getRepository(StandardModule)
  //           .save(newModule);
  //       } else {
  //         existingModule.sequence = sequence;
  //         await queryRunner.manager
  //           .getRepository(StandardModule)
  //           .save(existingModule);
  //       }
  //       const indicatorsPayload = modulePayload.indicator || [];
  //       for (
  //         let indIndex = 0;
  //         indIndex < indicatorsPayload.length;
  //         indIndex++
  //       ) {
  //         const indPayload = indicatorsPayload[indIndex];

  //         let existingIndicator = await queryRunner.manager
  //           .getRepository(StandardIndicator)
  //           .findOne({
  //             where: {
  //               standard_modules: { id: existingModule.id },
  //               master_indicator: { id: indPayload.id },
  //               is_deleted: false,
  //             },
  //             relations: ['standard_questions'],
  //           });

  //         if (!indPayload.checked) {
  //           if (existingIndicator) {
  //             existingIndicator.is_deleted = true;
  //             existingIndicator.deleted_at = new Date();
  //             await queryRunner.manager
  //               .getRepository(StandardIndicator)
  //               .save(existingIndicator);
  //           }
  //           continue;
  //         }

  //         if (!existingIndicator) {
  //           const masterIndicator = await queryRunner.manager
  //             .getRepository(Indicator)
  //             .findOne({
  //               where: { id: indPayload.id },
  //             });
  //           if (!masterIndicator)
  //             throw new BadRequestException(
  //               `Master Indicator not found: ${indPayload.id}`,
  //             );

  //           const newIndicator = queryRunner.manager
  //             .getRepository(StandardIndicator)
  //             .create({
  //               name: masterIndicator.name,
  //               description: masterIndicator.description,
  //               sequence: indIndex + 1,
  //               standard_modules: { id: existingModule.id },
  //               master_indicator: masterIndicator,
  //             });

  //           existingIndicator = await queryRunner.manager
  //             .getRepository(StandardIndicator)
  //             .save(newIndicator);
  //         } else {
  //           existingIndicator.sequence = indIndex + 1;
  //           await queryRunner.manager
  //             .getRepository(StandardIndicator)
  //             .save(existingIndicator);
  //         }

  //         // 3️⃣ QUESTIONS
  //         const questionsPayload = indPayload.question || [];
  //         for (let qIndex = 0; qIndex < questionsPayload.length; qIndex++) {
  //           const qPayload = questionsPayload[qIndex];
  //           const { id: qId, checked } = qPayload;
  //           let existingQuestion = await queryRunner.manager
  //             .getRepository(StandardQuestion)
  //             .findOne({
  //               where: {
  //                 standard_indicator: { id: existingIndicator.id },
  //                 master_question: { id: qId },
  //                 is_deleted: false,
  //               },
  //               relations: [
  //                 'standard_question_options',
  //                 'mixed_questions',
  //                 'sub_indicator_id',
  //                 'department',
  //               ],
  //             });
  //           if (!checked) {
  //             if (existingQuestion) {
  //               existingQuestion.is_deleted = true;
  //               existingQuestion.deleted_at = new Date();
  //               await queryRunner.manager
  //                 .getRepository(StandardQuestion)
  //                 .save(existingQuestion);
  //             }
  //             continue;
  //           }
  //           if (existingQuestion) {
  //             const existingSequence = await queryRunner.manager
  //             .getRepository(QuestionSequences)
  //             .findOne({
  //               where: { standard_question_id: { id: existingQuestion.id } },
  //               is_deleted: false,
  //             });
  //             const groupQuestion = await queryRunner.manager
  //               .getRepository(GroupQuestionSequences)
  //               .findOne({
  //                 where: {
  //                   standard_question: { id: existingQuestion.id },
  //                   is_deleted: false,
  //                 },
  //               });

  //             if (groupQuestion) {
  //               break;
  //             } else {
  //             await queryRunner.manager.getRepository(QuestionSequences).upsert(
  //               {
  //                 standard_question_id: existingQuestion,
  //                 sequence: qIndex + 1,
  //                 is_dependent: existingSequence?.is_dependent ?? false,
  //                 questable_type: existingQuestion.questable_type ?? QuestableType.STANDARD,
  //                 universal_question_id: existingQuestion.universal_question_id,
  //                 standard_indicators: {id: existingIndicator.id},
  //               },
  //                 ['standard_question_id'],
  //               );
  //             }
  //           } else {
  //             const masterQuestion = await queryRunner.manager
  //               .getRepository(Question)
  //               .findOne({
  //                 where: { id: qId, is_deleted: false },
  //                 relations: [
  //                   'sub_indicator',
  //                   'department',
  //                   'question_options',
  //                   'mixed_type_questions',
  //                 ],
  //               });
  //             if (!masterQuestion)
  //               throw new BadRequestException(
  //                 `Master Question not found: ${qId}`,
  //               );
  //             const newStandardQuestion = queryRunner.manager
  //               .getRepository(StandardQuestion)
  //               .create({
  //                 title: masterQuestion.title,
  //                 description: masterQuestion.description,
  //                 question_type: masterQuestion.question_type,
  //                 placeholder: masterQuestion.placeholder,
  //                 option_type:
  //                   masterQuestion.question_type !== 'MIXED_TYPE'
  //                     ? 'GENERAL'
  //                     : 'MIXED',
  //                 standard_indicator: {id: existingIndicator.id},
  //                 master_question: masterQuestion,
  //                 sub_indicator_id: masterQuestion.sub_indicator?.id,
  //                 department: masterQuestion.department?.id,
  //                 is_added_sequence: true,
  //                 universal_question_id: masterQuestion.universal_question_id,
  //               });
  //             const savedStandardQuestion = await queryRunner.manager
  //               .getRepository(StandardQuestion)
  //                 .save(newStandardQuestion);
  //             // Copy question options from master question
  //             if (
  //               masterQuestion.question_options &&
  //               masterQuestion.question_options.length > 0
  //             ) {
  //               const standardQuestionOptions =
  //                 masterQuestion.question_options.map((option) =>
  //                   queryRunner.manager
  //                     .getRepository(StandardQuestionOption)
  //                     .create({
  //                       text: option.text,
  //                       value: option.value,
  //                       sequence: option.sequence,
  //                       standard_question: savedStandardQuestion,
  //                       master_question_option: option,
  //                     }),
  //                 );
  //               await queryRunner.manager
  //                 .getRepository(StandardQuestionOption)
  //                 .save(standardQuestionOptions);
  //             }

  //             // Copy mixed type questions from master question
  //             if (
  //               masterQuestion.mixed_type_questions &&
  //               masterQuestion.mixed_type_questions.length > 0
  //             ) {
  //               const standardMixedQuestions =
  //                 masterQuestion.mixed_type_questions.map((mixedQ) =>
  //                   queryRunner.manager
  //                     .getRepository(StandardMixedQuestions)
  //                     .create({
  //                       value_question_type: mixedQ.value_question_type,
  //                       value_name: mixedQ.value_name,
  //                       value_enum: mixedQ.value_enum,
  //                       unit_name: mixedQ.unit_name,
  //                       unit_type: mixedQ.unit_type,
  //                       unit_enum: mixedQ.unit_enum,
  //                       standard_question: savedStandardQuestion,
  //                     }),
  //                 );
  //               await queryRunner.manager
  //                 .getRepository(StandardMixedQuestions)
  //                 .save(standardMixedQuestions);
  //             }

  //             const groupQuestion = await queryRunner.manager
  //               .getRepository(GroupQuestionSequences)
  //               .findOne({
  //                 where: {
  //                   standard_question: { id: savedStandardQuestion.id },
  //                   is_deleted: false,
  //                 },
  //               });
  //             if(groupQuestion) {
  //               break;
  //             } else {
  //                 await queryRunner.manager.getRepository(QuestionSequences).save({
  //                 sequence: qIndex + 1,
  //                 is_dependent: false,
  //                 questable_type: QuestableType.STANDARD,
  //                 universal_question_id:
  //                   savedStandardQuestion.universal_question_id,
  //                 standard_question_id: savedStandardQuestion,
  //                 standard_indicators: {id: existingIndicator.id},
  //                 });
  //             }
  //           }
  //         }
  //       }

  //       return { success: true, moduleId: modulePayload.id };
  //     });

  //     results.push(result);
  //   }

  //   return { success: true, results };
  // }

  async addModulesIndicatorsQuestionsToStandardOne(
    standardId: string,
    sequence: number,
    body: AddModulesIndicatorsQuestionsToStandardDto_opt,
  ) {
    const modulesPayload = body.data?.module || [];

    if (!modulesPayload.length) {
      throw new BadRequestException('Module payload is required');
    }

    const results = [];

    for (let mIndex = 0; mIndex < modulesPayload.length; mIndex++) {
      const modulePayload = modulesPayload[mIndex];

      const result = await this.executeInTransaction(async (queryRunner) => {
        let existingModule = await queryRunner.manager
          .getRepository(StandardModule)
          .findOne({
            where: {
              standard: { id: standardId },
              master_module: { id: modulePayload.id },
              is_deleted: false,
            },
            relations: [
              'standard_indicators',
              'standard_indicators.standard_questions.standard_question_options',
              'standard_indicators.standard_questions.mixed_questions',
              'standard_indicators.standard_questions.sub_indicator_id',
              'standard_indicators.standard_questions.department',
            ],
          });

        if (!modulePayload.checked) {
          if (existingModule) {
            existingModule.is_deleted = true;
            existingModule.deleted_at = new Date();
            await queryRunner.manager
              .getRepository(StandardModule)
              .save(existingModule);
          }
          return {
            success: true,
            message: 'Module soft-deleted',
            moduleId: modulePayload.id,
          };
        }

        if (!existingModule) {
          const masterModule = await queryRunner.manager
            .getRepository(Module)
            .findOne({
              where: { id: modulePayload.id },
            });
          if (!masterModule)
            throw new BadRequestException(
              `Master Module not found:${modulePayload.id}`,
            );

          const newModule = queryRunner.manager
            .getRepository(StandardModule)
            .create({
              name: masterModule.name,
              description: masterModule.description,
              sequence, // module sequence
              standard: { id: standardId },
              master_module: masterModule,
            });

          existingModule = await queryRunner.manager
            .getRepository(StandardModule)
            .save(newModule);
        } else {
          existingModule.sequence = sequence;
          await queryRunner.manager
            .getRepository(StandardModule)
            .save(existingModule);
        }
        const indicatorsPayload = modulePayload.indicator || [];
        for (
          let indIndex = 0;
          indIndex < indicatorsPayload.length;
          indIndex++
        ) {
          const indPayload = indicatorsPayload[indIndex];

          let existingIndicator = await queryRunner.manager
            .getRepository(StandardIndicator)
            .findOne({
              where: {
                standard_modules: { id: existingModule.id },
                master_indicator: { id: indPayload.id },
                is_deleted: false,
              },
              relations: ['standard_questions'],
            });

          if (!indPayload.checked) {
            if (existingIndicator) {
              existingIndicator.is_deleted = true;
              existingIndicator.deleted_at = new Date();
              await queryRunner.manager
                .getRepository(StandardIndicator)
                .save(existingIndicator);
            }
            continue;
          }

          if (!existingIndicator) {
            const masterIndicator = await queryRunner.manager
              .getRepository(Indicator)
              .findOne({
                where: { id: indPayload.id },
              });
            if (!masterIndicator)
              throw new BadRequestException(
                `Master Indicator not found:${indPayload.id}`,
              );

            const newIndicator = queryRunner.manager
              .getRepository(StandardIndicator)
              .create({
                name: masterIndicator.name,
                description: masterIndicator.description,
                sequence: indIndex + 1,
                standard_modules: { id: existingModule.id },
                master_indicator: masterIndicator,
              });

            existingIndicator = await queryRunner.manager
              .getRepository(StandardIndicator)
              .save(newIndicator);
          } else {
            existingIndicator.sequence = indIndex + 1;
            await queryRunner.manager
              .getRepository(StandardIndicator)
              .save(existingIndicator);
          }

          // 3️⃣ QUESTIONS
          const questionsPayload = indPayload.question || [];

          for (let qIndex = 0; qIndex < questionsPayload.length; qIndex++) {
            const qPayload = questionsPayload[qIndex];
            const { id: qId, checked } = qPayload;

            // ✅ fetch with soft-deleted rows
            let existingQuestion = await queryRunner.manager
              .getRepository(StandardQuestion)
              .createQueryBuilder('sq')
              .withDeleted()
              .leftJoinAndSelect('sq.standard_question_options', 'options')
              .leftJoinAndSelect('sq.mixed_questions', 'mixed')
              .leftJoinAndSelect('sq.sub_indicator_id', 'sub')
              .leftJoinAndSelect('sq.department', 'dept')
              .leftJoinAndSelect('sq.master_question', 'master')
              .where('sq.standard_indicator = :indicatorId', {
                indicatorId: existingIndicator.id,
              })
              .andWhere('sq.master_question = :qId', { qId })
              .getOne();

            // ❌ unchecked → soft delete
            if (!checked) {
              if (existingQuestion && !existingQuestion.is_deleted) {
                // Soft delete the question
                existingQuestion.is_deleted = true;
                existingQuestion.deleted_at = new Date();
                const savedQuestion = await queryRunner.manager
                  .getRepository(StandardQuestion)
                  .save(existingQuestion);

                // 🔥 Delete the question sequence entry
                const deleteResult = await queryRunner.manager
                  .getRepository(QuestionSequences)
                  .delete({
                    standard_question_id: { id: existingQuestion.id },
                    standard_indicators: { id: existingIndicator.id },
                  });
              } else {
              }
              continue;
            }

            // ✅ checked → restore or create
            if (existingQuestion) {
              // If it was soft-deleted, restore it
              if (existingQuestion.is_deleted) {
                existingQuestion.is_deleted = false;
                existingQuestion.deleted_at = null;

                // 🔥 IMPORTANT: Save and refresh to ensure we have the updated entity
                existingQuestion = await queryRunner.manager
                  .getRepository(StandardQuestion)
                  .save(existingQuestion);
              } else {
                await queryRunner.manager
                  .getRepository(StandardQuestion)
                  .save(existingQuestion);
              }

              // Now handle question sequences
              const groupQuestion = await queryRunner.manager
                .getRepository(GroupQuestionSequences)
                .findOne({
                  where: { standard_question: { id: existingQuestion.id } },
                });

              if (!groupQuestion) {
                // Check if sequence exists
                const existingQuestionSequence = await queryRunner.manager
                  .getRepository(QuestionSequences)
                  .findOne({
                    where: {
                      standard_question_id: { id: existingQuestion.id },
                      standard_indicators: { id: existingIndicator.id },
                    },
                  });

                if (existingQuestionSequence) {
                  // Update existing sequence
                  existingQuestionSequence.sequence = qIndex + 1;
                  const savedSeq = await queryRunner.manager
                    .getRepository(QuestionSequences)
                    .save(existingQuestionSequence);
                } else {
                  // Create new sequence
                  const newSeq = await queryRunner.manager
                    .getRepository(QuestionSequences)
                    .save({
                      standard_question_id: existingQuestion,
                      sequence: qIndex + 1,
                      is_dependent: false,
                      questable_type:
                        existingQuestion.questable_type ??
                        QuestableType.STANDARD,
                      universal_question_id:
                        existingQuestion.universal_question_id,
                      standard_indicators: existingIndicator,
                    });
                }
              }
            } else {
              const masterQuestion = await queryRunner.manager
                .getRepository(Question)
                .findOne({
                  where: { id: qId },
                  relations: [
                    'sub_indicator',
                    'department',
                    'question_options',
                    'mixed_type_questions',
                  ],
                });

              if (!masterQuestion) {
                throw new BadRequestException(
                  `Master Question not found: ${qId}`,
                );
              }

              // 🔥 CRITICAL FIX: Remove cascade and pass the indicator correctly
              // First, ensure existingIndicator is fully loaded
              const fullIndicator = await queryRunner.manager
                .getRepository(StandardIndicator)
                .findOne({
                  where: { id: existingIndicator.id },
                });

              if (!fullIndicator) {
                throw new BadRequestException(
                  `Indicator not found: ${existingIndicator.id}`,
                );
              }

              // Create the standard question with proper entity references
              const newStandardQuestion = queryRunner.manager
                .getRepository(StandardQuestion)
                .create({
                  title: masterQuestion.title,
                  description: masterQuestion.description,
                  question_type: masterQuestion.question_type,
                  placeholder: masterQuestion.placeholder,
                  option_type:
                    masterQuestion.question_type !== 'MIXED_TYPE'
                      ? 'GENERAL'
                      : 'MIXED',
                  standard_indicator: fullIndicator, // ✅ Use fully loaded entity
                  master_question: masterQuestion, // ✅ Already loaded with relations
                  sub_indicator_id: masterQuestion.sub_indicator || null, // ✅ Pass entity object or null
                  department: masterQuestion.department || null, // ✅ Pass entity object or null
                  is_added_sequence: true,
                  universal_question_id: masterQuestion.universal_question_id,
                  is_latest_data: masterQuestion.is_latest_data,
                });

              const savedStandardQuestion = await queryRunner.manager
                .getRepository(StandardQuestion)
                .save(newStandardQuestion);

              // 🔥 CRITICAL: Verify the save worked correctly
              const verifyQuestion = await queryRunner.manager
                .getRepository(StandardQuestion)
                .createQueryBuilder('sq')
                .leftJoinAndSelect('sq.standard_indicator', 'indicator')
                .where('sq.id = :id', { id: savedStandardQuestion.id })
                .getOne();

              if (!verifyQuestion?.standard_indicator) {
                console.error('❌❌❌ CRITICAL: Indicator is NULL after save!');
                throw new Error(
                  'Failed to save standard_indicator relationship',
                );
              }

              // Copy question options
              if (
                masterQuestion.question_options &&
                masterQuestion.question_options.length > 0
              ) {
                const standardQuestionOptions =
                  masterQuestion.question_options.map((option) =>
                    queryRunner.manager
                      .getRepository(StandardQuestionOption)
                      .create({
                        text: option.text,
                        value: option.value,
                        sequence: option.sequence,
                        standard_question: savedStandardQuestion,
                        master_question_option: option,
                      }),
                  );

                await queryRunner.manager
                  .getRepository(StandardQuestionOption)
                  .save(standardQuestionOptions);
              }

              // Copy mixed type questions
              if (
                masterQuestion.mixed_type_questions &&
                masterQuestion.mixed_type_questions.length > 0
              ) {
                const standardMixedQuestions =
                  masterQuestion.mixed_type_questions.map((mixedQ) =>
                    queryRunner.manager
                      .getRepository(StandardMixedQuestions)
                      .create({
                        value_question_type: mixedQ.value_question_type,
                        value_name: mixedQ.value_name,
                        value_enum: mixedQ.value_enum,
                        unit_name: mixedQ.unit_name,
                        unit_type: mixedQ.unit_type,
                        unit_enum: mixedQ.unit_enum,
                        standard_question: savedStandardQuestion,
                      }),
                  );

                await queryRunner.manager
                  .getRepository(StandardMixedQuestions)
                  .save(standardMixedQuestions);
              }

              // Check if this is a group question
              const groupQuestion = await queryRunner.manager
                .getRepository(GroupQuestionSequences)
                .findOne({
                  where: {
                    standard_question: { id: savedStandardQuestion.id },
                  },
                });

              if (!groupQuestion) {
                // Create question sequence for new question
                const newSeq = await queryRunner.manager
                  .getRepository(QuestionSequences)
                  .save({
                    sequence: qIndex + 1,
                    is_dependent: false,
                    questable_type: QuestableType.STANDARD,
                    universal_question_id:
                      savedStandardQuestion.universal_question_id,
                    standard_question_id: savedStandardQuestion,
                    standard_indicators: fullIndicator, // ✅ Use the same loaded indicator
                  });
              }
            }
          }
        }

        return { success: true, moduleId: modulePayload.id };
      });

      results.push(result);
    }

    return { success: true, results };
  }

  async _addModulesIndicatorsQuestionsToStandard(
    standardId: string,
    body: AddModulesIndicatorsQuestionsToStandardDto,
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      // const standard = await this.findStandardById(standardId);

      const modules = body.data?.module || [];
      const moduleIds = modules.map((m) => m.id);
      const indicatorIds = modules.flatMap((m) => m.indicator.map((i) => i.id));
      // const questionIds = modules.flatMap((m) =>
      //   m.indicator.flatMap((i) => i.question),
      // );
      const [
        masterModules,
        masterIndicators,
        // masterQuestions,
      ] = await Promise.all([
        queryRunner.manager
          .getRepository(Module)
          .createQueryBuilder('module')
          .where('module.id IN (:...moduleIds)', { moduleIds })
          .getMany(),
        queryRunner.manager
          .getRepository(Indicator)
          .createQueryBuilder('indicator')
          .leftJoinAndSelect('indicator.questions', 'question')
          .where('indicator.id IN (:...indicatorIds)', { indicatorIds })
          .getMany(),
        // queryRunner.manager
        //   .getRepository(Question)
        //   .createQueryBuilder('question')
        //   .where('question.id IN (:...questionIds)', { questionIds })
        //   .getMany(),
      ]);
      const findById = <T extends { id: string }>(list: T[], id: string) =>
        list.find((item) => item.id === id);
      let standardModule;
      let standardIndicator;
      let standardQuestion;
      await Promise.all(
        modules.map(async (mod) => {
          const moduleData: Module = findById(masterModules, mod.id);
          const duplicateModule = await queryRunner.manager
            .getRepository(StandardModule)
            .findOne({
              where: {
                master_module: { id: mod.id },
                standard: { id: standardId },
              },
            });
          if (duplicateModule) {
            throw new BadRequestException('Module is already exist');
          }
          if (!moduleData)
            throw new BadRequestException(`Module not found: ${mod.id}`);

          standardModule = await queryRunner.manager
            .getRepository(StandardModule)
            .findOne({
              where: {
                standard: { id: standardId },
                master_module: { id: mod?.id },
              },
              relations: ['standard'],
            });
          const [moduleSeq] = await Promise.all([
            queryRunner.manager
              .getRepository(StandardModule)
              .createQueryBuilder('m')
              .where('m.standard = :standardId', { standardId })
              .getCount(),
          ]);
          let moduleSequence = moduleSeq;
          if (!standardModule) {
            standardModule = await queryRunner.manager
              .getRepository(StandardModule)
              .save({
                name: moduleData?.name,
                description: moduleData.description,
                sequence: ++moduleSequence,
                standard: standardId,
                master_module: moduleData,
              });
          }

          const indicatorSeq = await queryRunner.manager
            .getRepository(StandardIndicator)
            .createQueryBuilder('i')
            .where('i.standard_modules_id = :standardModuleId', {
              standardModuleId: standardModule.id,
            })
            .getCount();

          let indicatorSequence = indicatorSeq;
          // Create a map to track sequence numbers for each indicator
          const indicatorSequenceCounts = new Map<string, number>();

          await Promise.all(
            mod.indicator.map(async (ind) => {
              const indicatorData: Indicator = findById(
                masterIndicators,
                ind.id,
              );
              const duplicateIndicator = await queryRunner.manager
                .getRepository(StandardIndicator)
                .findOne({
                  where: {
                    master_indicator: { id: ind.id },
                    standard_modules: { id: standardModule.id },
                  },
                });
              if (duplicateIndicator) {
                throw new BadRequestException('Indicator is already exist');
              }
              if (!indicatorData)
                throw new BadRequestException(`Indicator not found: ${ind.id}`);
              standardIndicator = await queryRunner.manager
                .getRepository(StandardIndicator)
                .findOne({
                  where: {
                    standard_modules: { id: standardModule?.id },
                    master_indicator: { id: ind?.id },
                  },
                  relations: ['standard_modules', 'question_sequences'],
                });
              if (!standardIndicator) {
                standardIndicator = await queryRunner.manager
                  .getRepository(StandardIndicator)
                  .save({
                    name: indicatorData.name,
                    description: indicatorData.description,
                    sequence: ++indicatorSequence,
                    standard_modules: standardModule,
                    master_indicator: indicatorData,
                  });
                // Initialize sequence counter for this indicator
                indicatorSequenceCounts.set(
                  standardIndicator.id,
                  standardIndicator.question_sequences.length,
                );
              }

              await Promise.all(
                indicatorData.questions.map(async (qid) => {
                  const questionData: Question = await queryRunner.manager
                    .getRepository(Question)
                    .findOne({
                      where: { id: qid.id },
                      relations: [
                        'question_options',
                        'mixed_type_questions',
                        'sub_indicator',
                      ],
                    });
                  const indId = standardIndicator;
                  if (!questionData)
                    throw new BadRequestException(
                      `Question not found: ${qid.id}`,
                    );
                  const duplicateQuestion = await queryRunner.manager
                    .getRepository(StandardQuestion)
                    .findOne({
                      where: {
                        master_question: { id: qid.id },
                        standard_indicator: { id: indId.id },
                      },
                    });
                  if (duplicateQuestion) {
                    throw new BadRequestException('Question is already exist');
                  }
                  standardQuestion = await queryRunner.manager
                    .getRepository(StandardQuestion)
                    .findOne({
                      where: {
                        standard_indicator: { id: indId.id },
                        master_question: { id: qid.id },
                      },
                      relations: ['standard_indicator'],
                    });

                  if (!standardQuestion) {
                    standardQuestion = await queryRunner.manager
                      .getRepository(StandardQuestion)
                      .save({
                        title: questionData.title,
                        description: questionData.description,
                        question_type: questionData.question_type,
                        placeholder: questionData.placeholder,
                        option_type:
                          questionData.question_type !== 'MIXED_TYPE'
                            ? 'GENERAL'
                            : 'MIXED',
                        standard_indicator: indId?.id,
                        master_question: questionData.id,
                        sub_indicatior_id: questionData?.sub_indicator?.id,
                        stastandard_sub_indicators:
                          questionData?.sub_indicator?.id,
                        department: questionData?.department?.id,
                        universal_question_id:
                          questionData?.universal_question_id,
                        is_latest_data: questionData?.is_latest_data,
                      });

                    // Get and increment the sequence counter for this indicator
                    const currentSequence =
                      indicatorSequenceCounts.get(indId.id) || 0;
                    const nextSequence = currentSequence + 1;
                    indicatorSequenceCounts.set(indId.id, nextSequence);

                    await queryRunner.manager.save(QuestionSequences, {
                      standard_question: standardQuestion,
                      standard_indicators: standardIndicator,
                      is_dependent: false,
                      questable_type: QuestableType.STANDARD,
                      sequence: nextSequence,
                      universal_question_id:
                        questionData?.universal_question_id,
                    });
                  }
                }),
              );
            }),
          );
        }),
      );
      return {
        success: true,
        message:
          'Modules, indicators ,standard questions and question sequences added successfully',
      };
    });
  }

  async updateAddRemoveQuestionSequence(
    standardId: string,
    body: UpdateAddRemoveQuestionSequenceDto,
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      // 1. First validate the standard exists and get all required relations
      const { indicator } = await this.validateStandardModuleIndicatorRelation(
        standardId,
        body.module_id,
        body.indicator_id,
      );

      // 2. Use existing sequences from validation (no need for additional query)
      const existingSequences = indicator.question_sequences || [];

      // 3. Process add operations (only for new questions)
      const addOperations = body.question_sequences.filter(
        (qs) =>
          qs.question_id &&
          (!qs.sequence_id || qs.sequence_id === null) &&
          !qs.is_removed,
      );

      if (addOperations.length > 0) {
        // Create a map of existing question IDs for quick duplicate checking

        const existingQuestionIds = new Set(
          existingSequences.map((s) => s.standard_question_id?.id),
        );

        // Check for duplicates in a single pass
        const questionIds = addOperations.map((qs) => qs.question_id);

        const duplicateQuestionIds = questionIds.filter((id) =>
          existingQuestionIds.has(id),
        );

        if (duplicateQuestionIds.length > 0) {
          throw new BadRequestException(
            `Questions already exist in sequence: ${duplicateQuestionIds.join(', ')}`,
          );
        }

        // Get all questions to be added in a single query
        const questions = await queryRunner.manager
          .getRepository(StandardQuestion)
          .findBy({ id: In(questionIds) });

        if (questions.length !== questionIds.length) {
          const foundIds = new Set(questions.map((q) => q.id));
          const missingIds = questionIds.filter((id) => !foundIds.has(id));
          throw new BadRequestException(
            `Questions not found: ${missingIds.join(', ')}`,
          );
        }

        // Create question sequences in bulk
        const currentSequence = existingSequences.length + 1;
        const questionSequences = addOperations.map((op, index) => {
          const question = questions.find((q) => q.id === op.question_id);
          const sequence = new QuestionSequences();
          sequence.sequence = currentSequence + index;
          sequence.is_dependent = false;
          sequence.questable_type = 'STANDARD';
          sequence.standard_question_id = question;
          sequence.universal_question_id = question.universal_question_id;
          sequence.standard_indicators = indicator;
          return sequence;
        });

        // Save sequences and update question status in parallel
        await Promise.all([
          queryRunner.manager.save(QuestionSequences, questionSequences),

          queryRunner.manager
            .createQueryBuilder()
            .update(StandardQuestion)
            .set({ is_added_sequence: true })
            .where('id IN (:...ids)', { ids: questionIds })
            .execute(),
        ]);
      }

      // 4. Process remove operations
      const removeOperations = body.question_sequences.filter(
        (qs) => qs.sequence_id && qs.is_removed,
      );

      if (removeOperations.length > 0) {
        const sequenceIds = removeOperations.map((op) => op.sequence_id);

        // Use sequences from validation data instead of additional query
        const sequencesToRemove = existingSequences.filter((seq) =>
          sequenceIds.includes(seq.id),
        );

        // Validate all sequences exist
        if (sequencesToRemove.length !== sequenceIds.length) {
          const foundIds = new Set(sequencesToRemove.map((s) => s.id));
          const missingIds = sequenceIds.filter((id) => !foundIds.has(id));
          throw new BadRequestException(
            `Question sequences not found: ${missingIds.join(', ')}`,
          );
        }

        // Collect all question IDs to update, including those from group questions
        const questionIds = new Set<string>();
        const groupQuestionIds = new Set<string>();

        sequencesToRemove.forEach((sequence) => {
          if (
            sequence.questable_type === QuestableType.GROUP &&
            sequence.group_questions
          ) {
            // Add all standard questions from the group through group_question_sequences
            sequence.group_questions.group_question_sequences?.forEach(
              (gqs) => {
                if (gqs.standard_question) {
                  questionIds.add(gqs.standard_question.id);
                }
              },
            );

            groupQuestionIds.add(sequence.group_questions.id);
          } else {
            // Add the main question
            questionIds.add(sequence.standard_question_id.id);
          }
        });

        // Get all question IDs from sequences being removed
        const sequenceQuestionIds = sequencesToRemove
          .filter(
            (seq) =>
              seq.standard_question_id &&
              seq.questable_type === QuestableType.STANDARD,
          )
          .map((seq) => seq.standard_question_id.id);

        let allRulesToDelete = [];
        let dependentSequenceIds = [];

        // Only check for rules if we have standard type sequences
        if (sequenceQuestionIds.length > 0) {
          // Get all dependent sequence IDs first to include them in the main query
          const sequencesToCheck = existingSequences.filter((seq) =>
            sequenceQuestionIds.includes(seq.standard_question_id?.id),
          );
          const allDependentSequenceIds = sequencesToCheck
            .map((seq) => seq.id)
            .concat(sequenceQuestionIds);

          // Single comprehensive query to get all rules (parent, dependent, and dependent sequence rules)
          const allRulesToDeleteCombined = await queryRunner.manager
            .getRepository(QuestionRules)
            .createQueryBuilder('qr')
            .leftJoinAndSelect('qr.dependent_question_sequence_id', 'dqs')
            .leftJoinAndSelect('qr.parent_question_id', 'pqs')
            .where(
              '(qr.parent_question_id IN (:...parentIds) OR qr.dependent_question_sequence_id IN (:...allDependentIds))',
              {
                parentIds: sequenceQuestionIds,
                allDependentIds: allDependentSequenceIds,
              },
            )
            .andWhere('qr.is_deleted = false')
            .getMany();

          // Separate parent and dependent rules for processing
          const parentRulesToDelete = allRulesToDeleteCombined.filter((rule) =>
            sequenceQuestionIds.includes(rule.parent_question_id?.id),
          );
          const dependentRulesToDelete = allRulesToDeleteCombined.filter(
            (rule) =>
              sequenceQuestionIds.includes(
                rule.dependent_question_sequence_id?.id,
              ),
          );

          // Combine all rules to delete
          allRulesToDelete = allRulesToDeleteCombined;

          // Get all dependent sequence IDs from the rules to be deleted
          dependentSequenceIds = parentRulesToDelete
            .map((rule) => rule.dependent_question_sequence_id?.id)
            .filter((id) => id);

          // For each dependent sequence, check if it has any other rules
          if (dependentSequenceIds.length > 0) {
            // Use the already loaded rules instead of additional query
            const allRulesForDependentSequences =
              allRulesToDeleteCombined.filter((rule) =>
                dependentSequenceIds.includes(
                  rule.dependent_question_sequence_id?.id,
                ),
              );

            // Find sequences that will have no rules after deletion
            const sequencesWithNoRules = dependentSequenceIds.filter(
              (seqId) => {
                // Get all rules for this sequence
                const sequenceRules = allRulesForDependentSequences.filter(
                  (rule) => rule.dependent_question_sequence_id?.id === seqId,
                );

                // Get rules being deleted for this sequence
                const rulesBeingDeleted = parentRulesToDelete.filter(
                  (rule) => rule.dependent_question_sequence_id?.id === seqId,
                );

                // If all rules for this sequence are being deleted, mark it for update
                return sequenceRules.length === rulesBeingDeleted.length;
              },
            );

            // Update is_dependent to false for sequences that will have no rules
            if (sequencesWithNoRules.length > 0) {
              await queryRunner.manager
                .createQueryBuilder()
                .update(QuestionSequences)
                .set({ is_dependent: false })
                .where('id IN (:...ids)', { ids: sequencesWithNoRules })
                .execute();
            }
          }
        }

        // Bulk update for deletion and sequence status in parallel
        await Promise.all([
          queryRunner.manager
            .createQueryBuilder()
            .update(StandardQuestion)
            .set({
              is_added_sequence: false,
            })
            .where('id IN (:...ids)', { ids: Array.from(questionIds) })
            .execute(),

          queryRunner.manager
            .createQueryBuilder()
            .update(QuestionSequences)
            .set({
              is_deleted: true,
              deleted_at: new Date(),
              standard_question_id: null,
              group_questions: null,
            })
            .where('id IN (:...ids)', { ids: sequenceIds })
            .execute(),

          // Delete associated group questions if any exist
          groupQuestionIds.size > 0
            ? queryRunner.manager
                .createQueryBuilder()
                .delete()
                .from(GroupQuestions)
                .where('id IN (:...ids)', { ids: Array.from(groupQuestionIds) })
                .execute()
            : Promise.resolve(),

          // Delete all rules (both parent and dependent) for the removed questions
          allRulesToDelete.length > 0
            ? queryRunner.manager
                .createQueryBuilder()
                .delete()
                .from(QuestionRules)
                .where('id IN (:...ids)', {
                  ids: allRulesToDelete.map((rule) => rule.id),
                })
                .execute()
            : Promise.resolve(),
        ]);
      }

      return {
        success: true,
        message: 'Question sequence updated successfully',
      };
    });
  }

  async validateStandardModuleIndicatorRelation(
    standardId: string,
    moduleId: string,
    indicatorId: string,
  ) {
    try {
      // Optimized query: Only load the specific indicator with required relations
      const indicator = await this.dataSource.manager
        .createQueryBuilder(StandardIndicator, 'indicator')
        .leftJoinAndSelect('indicator.standard_modules', 'module')
        .leftJoinAndSelect('module.standard', 'standard')
        .leftJoinAndSelect(
          'indicator.standard_questions',
          'standard_questions',
          'standard_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'indicator.question_sequences',
          'question_sequences',
          'question_sequences.is_deleted = false',
        )
        .leftJoinAndSelect(
          'standard_questions.standard_question_options',
          'standard_question_options',
          'standard_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.standard_question_id',
          'sequence_standard_question',
          'sequence_standard_question.is_deleted = false',
        )
        .leftJoinAndSelect(
          'sequence_standard_question.standard_question_options',
          'sequence_question_options',
          'sequence_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'question_sequences.group_questions',
          'group_questions',
          'group_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'group_questions.group_question_sequences',
          'group_question_sequences',
        )
        .leftJoinAndSelect(
          'group_question_sequences.standard_question',
          'gqs_standard_question',
          'gqs_standard_question.is_deleted = false',
        )
        .where('indicator.id = :indicatorId', { indicatorId })
        .andWhere('indicator.is_deleted = false')
        .andWhere('module.id = :moduleId', { moduleId })
        .andWhere('module.is_deleted = false')
        .andWhere('standard.id = :standardId', { standardId })
        .andWhere('standard.is_deleted = false')
        .getOne();

      if (!indicator) {
        throw new BadRequestException(
          'Invalid standard, module, or indicator relationship',
        );
      }

      return {
        standard: indicator.standard_modules.standard,
        module: indicator.standard_modules,
        indicator,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addRemoveQuestionRules(
    standardId: string,
    body: UpdateQuestionRulesDto,
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      const { indicator } = await this.validateStandardModuleIndicatorRelation(
        standardId,
        body.module_id,
        body.indicator_id,
      );

      // 1. Find the dependent question
      const dependentQuestion = indicator.standard_questions.find(
        (question) => question.id === body.question_id,
      );
      if (!dependentQuestion) {
        throw new BadRequestException('Invalid question id');
      }

      // 2. Get existing question rules for this dependent question
      const existingRules = await queryRunner.manager
        .getRepository(QuestionRules)
        .createQueryBuilder('qr')
        .leftJoinAndSelect('qr.parent_question_sequence_id', 'pqs')
        .leftJoinAndSelect('qr.parent_option_id', 'po')
        .leftJoinAndSelect('qr.dependent_question_id', 'dq')
        .where('qr.dependent_question_id = :questionId', {
          questionId: body.question_id,
        })
        .andWhere('qr.is_deleted = false')
        .getMany();

      const rulesToSaveOrUpdate: QuestionRules[] = [];

      // 3. Process each rule
      for (const rule of body.rules) {
        if (rule.is_removed) {
          // Find and mark matching rule as deleted
          const matchingRule = existingRules.find(
            (er) =>
              er.parent_question_sequence_id.standard_question.id ===
                rule.parent_question_id &&
              er.parent_option_id.id === rule.parent_question_option_id,
          );

          if (matchingRule) {
            matchingRule.is_deleted = true;
            matchingRule.deleted_at = new Date();
            rulesToSaveOrUpdate.push(matchingRule);
          }
        } else {
          // Create new rule
          const parentQuestionSequence = indicator.question_sequences.find(
            (qs) => qs.standard_question_id.id === rule.parent_question_id,
          );
          if (!parentQuestionSequence) {
            throw new BadRequestException(
              `Parent question sequence not found for question ID: ${rule.parent_question_id}`,
            );
          }

          const parentOption =
            parentQuestionSequence.standard_question_id.standard_question_options.find(
              (option) => option.id === rule.parent_question_option_id,
            );
          if (!parentOption) {
            throw new BadRequestException(
              `Parent question option not found for option ID: ${rule.parent_question_option_id}`,
            );
          }

          const questionRule = new QuestionRules();
          questionRule.dependent_question_sequence_id = parentQuestionSequence;
          questionRule.parent_option_id = parentOption;
          questionRule.parent_question_id = dependentQuestion;
          questionRule.universal_question_id =
            dependentQuestion.universal_question_id;
          rulesToSaveOrUpdate.push(questionRule);
        }
      }

      // 4. Save new rules and update existing ones
      if (rulesToSaveOrUpdate.length > 0) {
        await queryRunner.manager
          .getRepository(QuestionRules)
          .save(rulesToSaveOrUpdate);
      }

      return {
        success: true,
        message: 'Question rules updated/removed successfully',
        // new_rules: rulesToSave,
        // updated_rules: rulesToUpdate,
        rules: rulesToSaveOrUpdate,
      };
    });
  }

  async createModuleForStandard(
    standardId: string,
    body: CreateModuleForStandardDto,
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      // const queryBuilder = queryRunner.manager
      //   .getRepository(Standard)
      //   .createQueryBuilder('standard');
      // const standardWithRelations = buildStandardRelations(
      //   queryBuilder,
      //   standardId,
      // );

      // const standard = await standardWithRelations.getOne();

      const standard = await queryRunner.manager
        .getRepository(Standard)
        .findOne({
          where: { id: standardId },
          relations: ['standard_modules', 'standard_modules.master_module'],
        });

      if (!standard) {
        throw new BadRequestException('Standard Not Found');
      }

      if (standard.is_deleted) {
        throw new BadRequestException('Standard is deleted');
      }

      if (body.is_removed) {
        const standardModule = standard.standard_modules.find(
          (sm) => sm.id === body.module_id && sm.is_deleted === false,
        );
        if (!standardModule) {
          throw new BadRequestException('Standard module not found');
        }

        standardModule.is_deleted = true;
        standardModule.deleted_at = new Date();
        await queryRunner.manager
          .getRepository(StandardModule)
          .save(standardModule);

        return {
          success: true,
          message: 'Module removed successfully',
        };
      }

      const duplicateModule = standard.standard_modules.filter(
        (sm) =>
          sm.master_module.id === body.module_id && sm.is_deleted === false,
      );

      if (duplicateModule.length > 0) {
        throw new BadRequestException('Module already exists on this standard');
      }

      // 1. Get master modules
      const masterModule = await queryRunner.manager
        .createQueryBuilder(Module, 'm')
        .where('m.id = :id', { id: body.module_id })
        .leftJoinAndSelect(
          'm.indicators',
          'm_indicators',
          'm_indicators.is_deleted = false',
        )
        .leftJoinAndSelect(
          'm_indicators.questions',
          'm_questions',
          'm_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'm_questions.question_options',
          'm_question_options',
          'm_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'm_questions.mixed_type_questions',
          'm_mixed_type_questions',
          'm_mixed_type_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'm_questions.sub_indicator',
          'm_sub_indicator',
          'm_sub_indicator.is_deleted = false',
        )
        .leftJoinAndSelect(
          'm_mixed_type_questions.question',
          'm_question',
          'm_question.is_deleted = false',
        )
        .getOne();

      if (!masterModule) {
        throw new BadRequestException('Master module not found');
      }

      const standardModule = await queryRunner.manager
        .getRepository(StandardModule)
        .save({
          master_module: masterModule,
          name: masterModule.name,
          description: masterModule.description,
          standard: standard.id,
          sequence: standard.standard_modules.length + 1,
        });

      const masterIndicators = masterModule.indicators.sort(
        (a, b) => a.createdAt - b.createdAt,
      );

      const standardIndicators = masterIndicators.map((i, index) => {
        const standardIndicator = new StandardIndicator();
        standardIndicator.master_indicator = i;
        standardIndicator.standard_modules = standardModule;
        standardIndicator.name = i.name;
        standardIndicator.description = i.description;
        standardIndicator.sequence = index + 1;

        return standardIndicator;
      });

      await queryRunner.manager.save(StandardIndicator, standardIndicators);

      await this.createQuestionsAndOptionsForIndicators(
        standardIndicators,
        queryRunner,
      );

      return {
        success: true,
        message: 'Module created successfully with indicators and questions',
        data: {
          standard_module: standardModule,
          standard_indicators: standardIndicators,
        },
      };
    });
  }

  async createQuestionsAndOptionsForIndicators(
    indicators: StandardIndicator[],
    queryRunner: QueryRunner,
  ) {
    // Process each indicator and its questions sequentially
    for (const standardIndicator of indicators) {
      const masterIndicator = standardIndicator.master_indicator;

      if (masterIndicator.questions && masterIndicator.questions.length > 0) {
        // Create standard questions for this indicator & mixed type questions
        const standardQuestions = await this.createStandardQuestions(
          queryRunner,
          [standardIndicator],
          masterIndicator.questions,
        );

        // Create standard question options for these questions
        await this.createStandardQuestionOptions(
          queryRunner,
          standardQuestions,
          masterIndicator.questions,
        );
      }
    }
  }

  async createIndicatorForStandard(
    standardId: string,
    moduleId: string,
    body: CreateIndicatorForStandardDto,
  ) {
    return this.executeInTransaction(async (queryRunner) => {
      // const standard = await this.findStandardById(standardId);
      const standard = await queryRunner.manager.findOne(Standard, {
        where: { id: standardId },
        relations: [
          'standard_modules',
          'standard_modules.standard_indicators.master_indicator',
        ],
      });

      const module = standard.standard_modules.find((sm) => sm.id === moduleId);
      if (!module || module?.is_deleted) {
        throw new BadRequestException('Module not found on this standard');
      }

      // if (module.is_deleted) {
      //   throw new BadRequestException('Module is deleted');
      // }

      if (body.is_removed) {
        const standardIndicator = module.standard_indicators.find(
          (si) => si.id === body.indicator_id && si.is_deleted === false,
        );
        if (!standardIndicator) {
          throw new BadRequestException('Indicator not found on this module');
        }

        standardIndicator.is_deleted = true;
        standardIndicator.deleted_at = new Date();
        await queryRunner.manager.save(StandardIndicator, standardIndicator);

        return {
          success: true,
          message: 'Indicator removed successfully',
        };
      }

      const masterIndicator = await queryRunner.manager
        .createQueryBuilder(Indicator, 'i')
        .where('i.id = :id', { id: body.indicator_id })
        .leftJoinAndSelect(
          'i.questions',
          'i_questions',
          'i_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'i_questions.question_options',
          'i_question_options',
          'i_question_options.is_deleted = false',
        )
        .leftJoinAndSelect(
          'i_questions.mixed_type_questions',
          'i_mixed_type_questions',
          'i_mixed_type_questions.is_deleted = false',
        )
        .leftJoinAndSelect(
          'i_questions.sub_indicator',
          'i_sub_indicator',
          'i_sub_indicator.is_deleted = false',
        )
        .getOne();
      if (!masterIndicator) {
        throw new BadRequestException('Master indicator not found');
      }

      const duplicateIndicator = module.standard_indicators.find(
        (si) =>
          si.master_indicator.id === body.indicator_id &&
          si.is_deleted === false,
      );

      if (duplicateIndicator) {
        throw new BadRequestException(
          'Indicator already exists on this module on this standard',
        );
      }

      const standardIndicator = await queryRunner.manager.save(
        StandardIndicator,
        {
          master_indicator: masterIndicator,
          standard_modules: module.id,
          name: masterIndicator.name,
          description: masterIndicator.description,
          sequence: module.standard_indicators.length + 1,
        },
      );

      await this.createQuestionsAndOptionsForIndicators(
        [standardIndicator],
        queryRunner,
      );

      return {
        success: true,
        message: 'Indicator created successfully with questions and options',
        data: {
          standard_indicator: standardIndicator,
        },
      };
    });
  }

  async createStandardQuestion(
    standardId: string,
    moduleId: string,
    indicatorId: string,
    body: CreateStandardQuestionsDto,
  ) {
    return this.executeInTransaction(async (queryrunner) => {
      // const standard = await this.findStandardById(standardId);
      const standard = await queryrunner.manager.findOne(Standard, {
        where: { id: standardId },
        relations: [
          'standard_modules',
          'standard_modules.standard_indicators',
          'standard_modules.standard_indicators.standard_questions',
          'standard_modules.standard_indicators.standard_questions.master_question',
          'standard_modules.standard_indicators.standard_questions.mixed_questions',
          'standard_modules.standard_indicators.standard_questions.master_question.question_options',
          'standard_modules.standard_indicators.standard_questions.master_question.mixed_type_questions',
        ],
      });

      const module =
        standard.standard_modules?.find((sm) => sm.id === moduleId) ??
        (() => {
          throw new BadRequestException('Module not found on this standard');
        })();

      const indicator =
        module.standard_indicators?.find((si) => si.id === indicatorId) ??
        (() => {
          throw new BadRequestException('Indicator not found on this Module');
        })();

      const existingQuestion = indicator.standard_questions?.some((sq) =>
        body.questionId.includes(sq.master_question.id),
      );

      if (existingQuestion) {
        throw new BadRequestException(
          'Given question is already in this standard',
        );
      }

      const masterQuestions = await queryrunner.manager
        .getRepository(Question)
        .find({
          where: {
            indicator: { id: indicator.master_indicator.id },
            id: In(body.questionId),
          },
          relations: ['indicator', 'question_options', 'mixed_type_questions'],
        });

      let standardQuestions: StandardQuestion[];
      if (masterQuestions.length > 0) {
        const standardQuestionPayloads = [];
        masterQuestions.forEach((question) => {
          const standardquestion: any = new StandardQuestion();
          standardquestion.title = question.title;
          standardquestion.description = question.description;
          standardquestion.question_type = question.question_type;
          standardquestion.placeholder = question.placeholder;
          standardquestion.standard_indicator = indicator.id;
          standardquestion.master_question = question;
          standardquestion.department = question.department?.id;
          standardquestion.universal_question_id =
            question.universal_question_id;
          standardquestion.is_latest_data = question.is_latest_data;
          standardquestion.option_type =
            question.question_type !== 'MIXED_TYPE' ? 'GENERAL' : 'MIXED';

          standardQuestionPayloads.push(standardquestion);
        });
        standardQuestions = await queryrunner.manager
          .getRepository(StandardQuestion)
          .save(standardQuestionPayloads);

        // create mixed type questions if any
        if (masterQuestions.some((mq) => mq.question_type === 'MIXED_TYPE')) {
          await this.createStandardMixedQuestions(
            queryrunner,
            standardQuestions,
            masterQuestions,
          );
        }
        // create standard questionOptions
        await this.createStandardQuestionOptions(
          queryrunner,
          standardQuestions,
          masterQuestions,
        );
      }
      return {
        success: true,
        message: 'Standard question created successfully ',
        standardQuestions,
      };
    });
  }
}
