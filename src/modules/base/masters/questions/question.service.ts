import {
  BadRequestException,
  Injectable,
  Logger,
  Options,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { QuestionType } from 'src/enum/questiontype.enum';
import { DataSource, EntityManager, ILike, In, Not, Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import { Indicator } from '../indicators/indicator.entity';
import { Module } from '../modules/module.entity';
import { SubIndicator } from '../sub-indicators/sub-indicator.entity';
import { MixedTypeQuestion } from './mixed_type_question.entity';
import {
  CreateQuestionDto,
  MixedTypeQuestionDto,
  QuestionOptionsDeleteDto,
  UpdateQuestionDto,
} from './question.dto';
import { Question } from './question.entity';
import { QuestionOption } from './question_option.entity';
import { Department } from '../departments/department.entity';
import { StandardQuestion } from '../../standards/standard_questions/standard_question.entity';
import { StandardQuestionOption } from '../../standards/standard_questions/standard_question_options/standard_question_option.entity';
import { StandardMixedQuestions } from '../../standards/standard_questions/standard_mixed_questions/standard_mixed_question.entity';
import { StandardIndicator } from '../../standards/standard_indicators/standard_indicator.entity';

@Injectable()
export class MasterQuestionService {
  private readonly logger = new Logger(MasterQuestionService.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionModel: Repository<Question>,
    @InjectRepository(Indicator)
    private readonly indicatorModel: Repository<Indicator>,
    @InjectRepository(SubIndicator)
    private readonly subIndicatorModel: Repository<SubIndicator>,
    @InjectRepository(QuestionOption)
    private readonly questionOptionModel: Repository<QuestionOption>,
    private readonly datasource: DataSource,
  ) {}

  public async createQuestion(body: CreateQuestionDto) {
    const connection = this.datasource.createQueryRunner();
    await connection.connect();
    await connection.startTransaction();

    try {
      await this.validateQuestionInput(body);
      const indicator = await this.getIndicator(body.indicator_id);
      let subIndicator;
      if (body.subindicator_id) {
        subIndicator = await this.getSubIndicator(body?.subindicator_id);
      }
      let department;
      if (body.department_id) {
        department = await connection.manager
          .getRepository(Department)
          .findOne({
            where: { id: body.department_id },
          });
      }

      await this.validateQuestionUniqueness(
        body.title.trim(),
        indicator,
        subIndicator,
      );

      if (body.universal_question_id) {
        const universalQuestion = await connection.manager
          .getRepository(Question)
          .findOne({
            where: { universal_question_id: body.universal_question_id },
          });
        if (universalQuestion) {
          throw new BadRequestException('Universal question ID already exists');
        }
      }

      const question = await connection.manager.getRepository(Question).save({
        title: body.title.trim(),
        description: body?.description?.trim(),
        placeholder: body.place_holder?.trim(),
        indicator,
        sub_indicator: subIndicator,
        question_type: body.question_type,
        department: department?.id || null,
        universal_question_id: body.universal_question_id,
        is_latest_data: body.is_latest_data,
      });

      if (
        [QuestionType.SINGLE_SELECT, QuestionType.MULTI_SELECT].includes(
          body.question_type,
        )
      ) {
        await this.saveQuestionOptions(
          body.options,
          question,
          connection.manager,
        );
      } else if (QuestionType.MIXED_TYPE === body.question_type) {
        await this.saveMixedTypeQuestions(
          body.mixed_type_question,
          question,
          connection.manager,
        );
      }

      await connection.commitTransaction();
      return {
        success: true,
        message: 'Question created successfully',
        data: question,
      };
    } catch (error) {
      await connection.rollbackTransaction();
      this.logger.error(`Error creating question: ${error.message}`);
      throw new BadRequestException(
        error.message || 'Failed to create question',
      );
    } finally {
      await connection.release();
    }
  }

  public async getAllQuestions(params: any) {
    try {
      const { filter } = params;
      const queryOptions = this.buildQueryOptions(params, filter);

      const [data, totalCount] =
        await this.questionModel.findAndCount(queryOptions);

      const filteredData = data.map((question) => {
        question.question_options = question.question_options.filter(
          (option) => !option.is_deleted,
        );

        if (question.sub_indicator && question.sub_indicator.is_deleted) {
          question.sub_indicator = null;
        }

        return question;
      });

      return {
        success: true,
        questions: filteredData,
        meta: {
          currentCount: filteredData.length,
          currentPage: Number(params.page),
          currentLimit: Number(params.limit),
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch questions: ${error.message}`,
      );
    }
  }

  public async getQuestionById(questionId: string) {
    try {
      const question = await this.questionModel.findOne({
        where: { id: questionId },
        relations: [
          'question_options',
          'mixed_type_questions',
          'indicator',
          'indicator.module',
          'sub_indicator',
          'department',
        ],
      });
      if (!question || question.is_deleted === true) {
        throw new BadRequestException('Invalid question');
      }

      question.question_options = question.question_options.filter(
        (options) => !options.is_deleted,
      );
      return { success: true, question };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve question: ${error.message}`,
      );
    }
  }

  public async updateQuestionById(questionId: string, body: UpdateQuestionDto) {
    const connection =
      await this.questionModel.manager.connection.createQueryRunner();
    await connection.startTransaction();
    try {
      const question = await this._getQuestionById(questionId);

      const indicator = await this.getIndicator(body.indicator_id);

      const standardIndicator = await connection.manager
        .getRepository(StandardIndicator)
        .findOne({ where: { master_indicator: { id: indicator.id } } });

      let subIndicator;
      if (body.subindicator_id) {
        subIndicator = await this.getSubIndicator(body?.subindicator_id);
      }
      let department;
      if (body.department_id) {
        department = await connection.manager
          .getRepository(Department)
          .findOne({ where: { id: body.department_id } });
      }

      await this.validateQuestionUniqueness(
        body.title.trim(),
        indicator,
        subIndicator,
        questionId,
      );

      if (
        body.question_type === QuestionType.SINGLE_SELECT ||
        body.question_type === QuestionType.MULTI_SELECT
      ) {
        if (body.options && body.options.length > 0) {
          await Promise.all(
            body.options.map(async (option: any) => {
              if (!(option.text || option.value)) {
                throw new BadRequestException('Please enter option text value');
              }

              if (option.id) {
                const _option = await connection.manager
                  .getRepository(QuestionOption)
                  .findOne({
                    where: { id: option.id },
                  });

                if (_option) {
                  _option.text = option.text;
                  _option.value = option.value;
                  await connection.manager
                    .getRepository(QuestionOption)
                    .update(option.id, _option);

                  await connection.manager
                    .getRepository(StandardQuestionOption)
                    .update(
                      { master_option: { id: option.id } },
                      {
                        text: option.text,
                        value: option.value,
                      },
                    );
                } else {
                  throw new BadRequestException(
                    `Option with id ${option.id} not found`,
                  );
                }
              } else {
                await connection.manager.getRepository(QuestionOption).save({
                  text: option.text.trim(),
                  value: option.value.trim(),
                  question,
                });
                await connection.manager
                  .getRepository(StandardQuestionOption)
                  .save({
                    text: option.text.trim(),
                    value: option.value.trim(),
                    question,
                  });
              }
            }),
          );
        }
      } else if (
        QuestionType.MIXED_TYPE === question.question_type &&
        body.mixed_type_question.id
      ) {
        const {
          id,
          question_type,
          value_name,
          value_enum,
          unit_name,
          unit_type,
          unit_enum,
        } = body.mixed_type_question;
        if (id) {
          const question = await connection.manager
            .getRepository(MixedTypeQuestion)
            .findOne({ where: { id, question: { id: questionId } } });
          if (!question) {
            throw new BadRequestException('Invalid Mixed type question');
          }

          await connection.manager.getRepository(MixedTypeQuestion).update(id, {
            value_question_type: question_type,
            value_name,
            value_enum,
            unit_type,
            unit_name,
            unit_enum,
          });

          const standardQuestion = await connection.manager
            .getRepository(StandardQuestion)
            .findOne({ where: { master_question: { id: questionId } } });

          if (standardQuestion) {
            await connection.manager
              .getRepository(StandardMixedQuestions)
              .update(
                { standard_question: { id: standardQuestion?.id } },
                {
                  value_question_type: question_type,
                  value_name,
                  value_enum,
                  unit_type,
                  unit_name,
                  unit_enum,
                },
              );
          }
        }
      }

      await connection.manager.getRepository(Question).update(
        { id: questionId },
        {
          title: body.title,
          description: body.description,
          placeholder: body.place_holder,
          indicator,
          sub_indicator: subIndicator?.id || null,
          question_type: body.question_type,
          department: department?.id || null,
          universal_question_id: question.universal_question_id,
          is_latest_data: body.is_latest_data,
        },
      );

      await connection.manager.getRepository(StandardQuestion).update(
        { master_question: { id: questionId } },
        {
          standard_indicator: { id: standardIndicator?.id || null },
          title: body.title,
          description: body.description,
          placeholder: body.place_holder,
          sub_indicator_id: subIndicator?.id || null,
          department: { id: department?.id || null },
          universal_question_id: body.universal_question_id,
          is_latest_data: body.is_latest_data,
        },
      );

      await connection.commitTransaction();

      return {
        success: true,
        message: 'Question updated successfully',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(
        `Failed to update question: ${error.message}`,
      );
    } finally {
      await connection.release();
    }
  }

  public async deleteQuestionById(questionId: string) {
    const connection =
      await this.questionModel.manager.connection.createQueryRunner();
    await connection.startTransaction();

    try {
      const question = await this._getQuestionById(questionId);
      if (!question || question.is_deleted === true) {
        throw new BadRequestException('Question not found');
      }

      await this.questionModel.update(questionId, {
        is_deleted: true,
        deleted_at: new Date(),
      });

      return {
        success: true,
        message: 'Question deleted successfully',
      };
    } catch (error) {
      await connection.rollbackTransaction();
      throw new BadRequestException(
        `Failed to delete question:${error.message}` || error,
      );
    } finally {
      await connection.release();
    }
  }

  public async softDeleteOptionsByQuestionId(
    questionId: string,
    body: QuestionOptionsDeleteDto,
  ) {
    try {
      const question = await this._getQuestionById(questionId);
      if (!question || question.is_deleted === true) {
        throw new BadRequestException('Question not found');
      }

      const foundOptions = await this.questionOptionModel.find({
        where: {
          id: In(body.optionIds),
          question: { id: questionId },
          is_deleted: false,
        },
        select: ['id'],
      });

      const foundIds = foundOptions.map((opt) => opt.id);
      const missingIds = body.optionIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new BadRequestException(
          `The following option IDs were not found or already deleted: ${missingIds.join(', ')}`,
        );
      }

      await this.questionOptionModel.update(
        { id: In(foundIds), question: { id: questionId } },
        {
          is_deleted: body.isDeleted,
          deleted_at: body.isDeleted ? new Date() : null,
          mixed_type_question: null,
        },
      );

      return {
        success: true,
        message: 'Question option deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete question options: ${error.message}` || error,
      );
    }
  }

  private async validateQuestionInput(body: CreateQuestionDto) {
    if (!body.title?.trim()) {
      throw new BadRequestException('Question title is required');
    }

    // if (body.title) {
    //   const question = await this.questionModel.findOne({
    //     where: { title: body.title },
    //   });
    //   if (question) {
    //     throw new BadRequestException('Question Already exist');
    //   }
    // }

    if (!Object.values(QuestionType).includes(body.question_type)) {
      throw new BadRequestException('Invalid question type');
    }

    if (
      [QuestionType.SINGLE_SELECT, QuestionType.MULTI_SELECT].includes(
        body.question_type,
      )
    ) {
      if (!body.options?.length) {
        throw new BadRequestException(
          'Options are required for select type questions',
        );
      }
      // if (body.options.some((opt) => !opt.value?.trim() || !opt.text?.trim())) {
      //   throw new BadRequestException('All options must have a text / value');
      // }
    }
  }

  private async getIndicator(indicator_id: string): Promise<Indicator> {
    try {
      const indicator = await this.indicatorModel.findOne({
        where: { id: indicator_id, is_deleted: false },
      });
      if (!indicator) {
        throw new BadRequestException('Invalid indicator ID');
      }
      return indicator;
    } catch (error) {
      this.logger.error(`Error getting indicator: ${error.message}`);
      throw new BadRequestException('Failed to get indicator');
    }
  }

  private async getSubIndicator(id: string): Promise<SubIndicator> {
    try {
      const subIndicator = await this.subIndicatorModel.findOne({
        where: { id, is_deleted: false },
      });
      if (subIndicator) {
        return subIndicator;
      }
    } catch (error) {
      this.logger.error(`Error validating sub-indicator: ${error.message}`);
    }
    throw new BadRequestException('Failed to validate sub-indicator');
  }

  private async saveQuestionOptions(
    options: any[],
    question: Question,
    manager: EntityManager,
  ): Promise<QuestionOption[]> {
    try {
      const optionEntities = options.map((option) =>
        this.questionOptionModel.create({
          text: option.text.trim(),
          value: option.value?.trim(),
          question,
        }),
      );
      return await manager.getRepository(QuestionOption).save(optionEntities);
    } catch (error) {
      this.logger.error(`Error saving question options: ${error.message}`);
      throw new BadRequestException('Failed to save question options');
    }
  }

  private async saveMixedTypeQuestions(
    mixedQuestions: MixedTypeQuestionDto,
    question: Question,
    manager,
  ) {
    try {
      if (!mixedQuestions.value_name && !mixedQuestions.unit_name) {
        throw new BadRequestException('Value name and unit name are required');
      }
      if (
        mixedQuestions.value_question_type === QuestionType.SINGLE_SELECT ||
        (mixedQuestions.value_question_type === QuestionType.MULTI_SELECT &&
          mixedQuestions.unit_type === QuestionType.SINGLE_SELECT) ||
        mixedQuestions.unit_type === QuestionType.MULTI_SELECT
      ) {
        return await manager.getRepository(MixedTypeQuestion).save({
          value_question_type: mixedQuestions.value_question_type,
          value_name: mixedQuestions.value_name,
          valuevalue_enum: mixedQuestions?.value_enum,
          unit_name: mixedQuestions.unit_name,
          unit_type: mixedQuestions.unit_type,
          unit_enum: mixedQuestions?.unit_enum,
          question,
        });
      }
      return await manager.getRepository(MixedTypeQuestion).save({
        value_question_type: mixedQuestions.value_question_type,
        value_name: mixedQuestions.value_name,
        value_enum: mixedQuestions.value_enum,
        unit_name: mixedQuestions.unit_name,
        unit_type: mixedQuestions.unit_type,
        unit_enum: mixedQuestions.unit_enum,
        question,
      });
    } catch (error) {
      this.logger.error(
        `Error saving mixed question options: ${error.message}`,
      );
    }
    throw new BadRequestException('Failed to save mixed question options');
  }

  private buildWhereConditions(filter: any) {
    const { search, is_deleted, indicator_id, module_id, ...otherFilters } =
      filter;
    const whereConditions: any = {
      ...otherFilters,
      is_deleted: is_deleted !== undefined ? is_deleted : false,
    };

    if (search) {
      whereConditions.title = ILike(`%${search}%`);
    }

    if (indicator_id) {
      delete whereConditions.indicator_name;
      whereConditions.indicator = { id: indicator_id };
    }

    if (module_id) {
      whereConditions.indicator = {
        ...(whereConditions.indicator || {}),
        module: { id: module_id },
      };
    }

    return whereConditions;
  }

  private buildQueryOptions(params: any = {}, filter: any = {}) {
    const { limit = 10, page = 1, sort = {}, skip = 0 } = params;

    return {
      page,
      take: limit,
      skip,
      order: sort,
      where: this.buildWhereConditions(filter),
      relations: [
        'question_options',
        'mixed_type_questions',
        'indicator',
        'indicator.module',
        'sub_indicator',
        'department',
      ],
    };
  }

  private async _getQuestionById(question_id: string) {
    const question = await this.questionModel.findOne({
      where: { id: question_id, is_deleted: false },
      relations: [
        'question_options',
        'mixed_type_questions',
        'indicator',
        'indicator.module',
        'sub_indicator',
      ],
    });

    if (!question || question.is_deleted === true) {
      throw new BadRequestException('Question not found');
    }

    return question;
  }

  async processExcelFile(file: any) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workbook = xlsx.readFile(file.path);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const results = {
        errors: [],
      };

      for (const [index, row] of data.entries()) {
        try {
          // Validate required fields
          const requiredFields = [
            'Module Name',
            'Indicator Name',
            'Question Title',
            'Question Type',
            'Universal Question ID',
          ];
          const missingFields = requiredFields.filter((field) => !row[field]);

          if (missingFields.length > 0) {
            throw new Error(
              `Missing required fields: ${missingFields.join(', ')}`,
            );
          }

          let module = await queryRunner.manager.findOne(Module, {
            where: { name: row['Module Name'] },
          });

          if (!module) {
            module = queryRunner.manager.create(Module, {
              name: row['Module Name'],
              description: row['Module Description'],
            });
            await queryRunner.manager.save(module);
          }

          let indicator = await queryRunner.manager.findOne(Indicator, {
            where: { name: row['Indicator Name'] },
          });

          if (!indicator) {
            indicator = queryRunner.manager.create(Indicator, {
              name: row['Indicator Name'],
              description: row['Indicator Description'],
              module,
            });
            await queryRunner.manager.save(indicator);
          }

          let subIndicator = null;
          if (row['Sub-Indicator Name']) {
            subIndicator = await queryRunner.manager.findOne(SubIndicator, {
              where: { name: row['Sub-Indicator Name'] },
            });

            if (!subIndicator) {
              subIndicator = queryRunner.manager.create(SubIndicator, {
                name: row['Sub-Indicator Name'],
                description: row['Sub-Indicator Description'],
              });
              await queryRunner.manager.save(subIndicator);
            }
          }

          let department = null;
          if (row['Department Name']) {
            department = await queryRunner.manager.findOne(Department, {
              where: { name: row['Department Name'] },
            });

            if (!department) {
              department = queryRunner.manager.create(Department, {
                name: row['Department Name'],
              });
              await queryRunner.manager.save(department);
            }
          }

          // Validate question type
          if (!Object.values(QuestionType).includes(row['Question Type'])) {
            throw new Error(
              `Invalid question type: ${row['Question Type']}. Must be one of: ${Object.values(QuestionType).join(', ')}`,
            );
          }

          if (row['Universal Question ID']) {
            const universalQuestion = await queryRunner.manager.findOne(
              Question,
              {
                where: { universal_question_id: row['Universal Question ID'] },
              },
            );
            if (universalQuestion) {
              throw new Error('Universal question ID already exists');
            }
          }

          // Create question
          const question = queryRunner.manager.create(Question, {
            title: row['Question Title'],
            description: row['Question Description'],
            question_type: row['Question Type'],
            placeholder: row['Placeholder'],
            indicator,
            sub_indicator: subIndicator,
            department,
            universal_question_id: row['Universal Question ID'],
            is_latest_data: row['Is Latest Data'],
          });

          const savedQuestion = await queryRunner.manager.save(question);

          // Process options if they exist
          if (
            (row['Options'] &&
              savedQuestion.question_type === QuestionType.SINGLE_SELECT) ||
            savedQuestion.question_type === QuestionType.MULTI_SELECT
          ) {
            try {
              const options = JSON.parse(row['Options']);
              if (!Array.isArray(options)) {
                throw new Error('Options must be an array');
              }

              const optionEntities = options.map((option, optIndex) => {
                if (!option.text) {
                  throw new Error(
                    `Option at index ${optIndex} is missing required fields (text/value)`,
                  );
                }
                return queryRunner.manager.create(QuestionOption, {
                  text: option.text,
                  value: option.value,
                  question: savedQuestion,
                });
              });
              await queryRunner.manager.save(optionEntities);
            } catch (error) {
              throw new Error(`Invalid options format: ${error.message}`);
            }
          }

          if (savedQuestion.question_type === QuestionType.MIXED_TYPE) {
            try {
              const mixedQuestions = JSON.parse(row['Options']);
              if (
                !mixedQuestions.value_question_type ||
                !mixedQuestions.value_name
              ) {
                throw new Error(
                  'Mixed type question is missing required fields',
                );
              }
              const createMixedQuestion = queryRunner.manager.create(
                MixedTypeQuestion,
                {
                  value_question_type: mixedQuestions.value_question_type,
                  value_name: mixedQuestions.value_name,
                  value_enum: mixedQuestions.value_enum,
                  unit_type: mixedQuestions.unit_type,
                  unit_name: mixedQuestions.unit_name,
                  unit_enum: mixedQuestions.unit_enum,
                  question: savedQuestion,
                },
              );
              await queryRunner.manager.save(createMixedQuestion);
            } catch (error) {
              throw new Error(
                `Invalid mixed type question format: ${error.message}`,
              );
            }
          }
        } catch (error) {
          results.errors.push({
            rowNumber: index + 1,
            row,
            error: error.message,
          });
        }
      }

      // If we have any errors in processing rows, rollback the transaction
      if (results.errors.length > 0) {
        await queryRunner.rollbackTransaction();
        return {
          success: false,
          message: 'Failed to process some rows in the Excel file',
          details: results,
        };
      }

      // Commit the transaction if everything is successful
      await queryRunner.commitTransaction();

      // Clean up the uploaded file
      fs.unlinkSync(file.path);

      return {
        success: true,
        message: 'Successfully processed all rows in the Excel file',
        // details: results,
      };
    } catch (error) {
      // Rollback the transaction on any error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to process Excel file');
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  private async validateQuestionUniqueness(
    title: string,
    indicator: Indicator,
    subIndicator?: SubIndicator,
    excludeQuestionId?: string,
  ) {
    const whereCondition: any = {
      title,
      indicator: { id: indicator.id },
    };

    if (subIndicator) {
      whereCondition.sub_indicator = { id: subIndicator.id };
    }

    if (excludeQuestionId) {
      whereCondition.id = Not(excludeQuestionId);
    }

    const existingQuestion = await this.questionModel.findOne({
      where: whereCondition,
      relations: ['indicator', 'sub_indicator'],
    });

    if (existingQuestion) {
      throw new BadRequestException(
        `A question with this title already exists for the selected indicator${
          subIndicator ? ' and sub-indicator' : ''
        }`,
      );
    }
  }
}
