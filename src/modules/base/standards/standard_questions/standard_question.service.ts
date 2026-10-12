import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { QuestableType } from 'src/enum/questiontype.enum';
import { Standard } from '../standard.entity';
import { StandardIndicator } from '../standard_indicators/standard_indicator.entity';
import { StandardModule } from '../standard_modules/standard_module.entity';
import {
  CreateQuestionRulesDto,
  GroupQuestionsDto,
  QuestionsRemove,
  RemoveQuestionRulesDto,
} from './standard_question.dto';
import { StandardQuestion } from './standard_question.entity';
import { QuestionRules } from './question_sequences/question_rules/question_rule.entity';
import { QuestionSequences } from './question_sequences/question_sequence.entity';
import { GroupQuestions } from './group_questions/group_question.entity';
import { GroupQuestionSequences } from './group_questions/group_question_sequence.entity';
import {
  buildStandardRelations,
  STANDARD_RELATIONS,
} from '../constants/standard.constants';

@Injectable()
export class StandardQuestionService {
  constructor(
    @InjectRepository(StandardQuestion)
    private readonly standardQuestionModel: Repository<StandardQuestion>,
    private readonly dataSource: DataSource,
  ) {}

  async removeQuestions(
    standardId: string,
    moduleId: string,
    indicatorId: string,
    questionIds: QuestionsRemove,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const standard = await queryRunner.manager
        .getRepository(Standard)
        .findOne({ where: { id: standardId } });

      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      const module = await queryRunner.manager
        .getRepository(StandardModule)
        .findOne({
          where: { id: moduleId, standard: { id: standardId } },
        });

      if (!module) {
        throw new BadRequestException('module not found');
      }

      const indicator = await queryRunner.manager
        .getRepository(StandardIndicator)
        .findOne({
          where: { id: indicatorId, standard_modules: { id: moduleId } },
        });

      if (!indicator) {
        throw new BadRequestException('indicator not found');
      }

      const questionsToRemove = await queryRunner.manager
        .getRepository(StandardQuestion)
        .find({
          where: {
            id: In(questionIds.id),
            standard_indicator: { id: indicator.id },
          },
        });

      for (const indicator of questionsToRemove) {
        ((indicator.is_deleted = true), (indicator.standard_indicator = null));
      }

      await queryRunner.manager
        .getRepository(StandardQuestion)
        .save(questionsToRemove);

      await queryRunner.commitTransaction();

      return { success: true, message: 'Question removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async createQuestionRules(
    standardId: string,
    moduleId: string,
    indicatorId: string,
    body: CreateQuestionRulesDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { indicator } = await this.validateStandardModuleIndicatorRelation(
        standardId,
        moduleId,
        indicatorId,
      );

      const questionSequence = indicator.question_sequences.find(
        (qs) => qs.id === body.question_sequence_id,
      );

      if (!questionSequence) {
        throw new BadRequestException(
          'Given question sequence id is not related with the indicator ',
        );
      }

      // if (questionSequence.is_dependent) {
      //   throw new BadRequestException(
      //     'Given question sequence is already a dependent question',
      //   );
      // }

      const { validRules, invalidRules, invalidParentQuestions } =
        this.validateRules(body.rules, indicator, questionSequence);

      if (invalidRules.length > 0) {
        throw new BadRequestException({
          message: invalidRules[0].error,
          invalidRules,
        });
      }

      if (invalidParentQuestions.length > 0) {
        throw new BadRequestException({
          message: invalidParentQuestions[0].error,
          invalidParentQuestions,
        });
      }

      questionSequence.is_dependent = true;

      await queryRunner.manager
        .getRepository(QuestionSequences)
        .save(questionSequence);
      await queryRunner.manager.getRepository(QuestionRules).save(validRules);

      await queryRunner.commitTransaction();
      return { success: true, message: 'Question rules created successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || error);
    } finally {
      await queryRunner.release();
    }
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
          'question_sequences.question_rules',
          'question_rules',
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

  private validateRules(rules, indicator, questionSequence) {
    const invalidRules = [];
    const validRules = [];
    const invalidParentQuestions = [];

    for (const rule of rules) {
      if (
        questionSequence?.questable_type === QuestableType.STANDARD &&
        questionSequence?.standard_question_id?.id === rule.parent_question_id
      ) {
        throw new BadRequestException(
          `Parent question is the same as the question sequence: ${rule.parent_question_id}`,
        );
      }

      const parentSequence = indicator.standard_questions.find(
        (qs) => qs?.id === rule.parent_question_id,
      );

      if (!parentSequence) {
        invalidRules.push({
          rule,
          error: `Parent question not found in indicator: ${rule.parent_question_id}`,
        });
        continue;
      }

      const parentSequenceQuestion = indicator.question_sequences.find(
        (qs) => qs?.standard_question_id?.id === rule.parent_question_id,
      );

      if (!parentSequenceQuestion) {
        invalidRules.push({
          rule,
          error: `Parent question not found in indicator question sequences: ${rule.parent_question_id}`,
        });
        continue;
      }

      const optionExists = parentSequence.standard_question_options.find(
        (opt) => opt.id === rule.parent_question_option_id,
      );
      if (!optionExists) {
        invalidRules.push({
          rule,
          error: `Parent question option not found for question ${rule.parent_question_id}: ${rule.parent_question_option_id}`,
        });
        continue;
      }

      if (parentSequence.is_dependent) {
        invalidRules.push({
          rule,
          error: `Cannot create rules for dependent question: ${rule.parent_question_id}`,
        });
        continue;
      }

      validRules.push({
        dependent_question_sequence_id: questionSequence,
        parent_question_id: parentSequence.id,
        parent_option_id: optionExists,
        universal_question_id: parentSequence.universal_question_id,
      });
    }

    return { validRules, invalidRules, invalidParentQuestions };
  }

  async groupQuestions(
    standardId: string,
    moduleId: string,
    indicatorId: string,
    body: GroupQuestionsDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { indicator } = await this.validateStandardModuleIndicatorRelation(
        standardId,
        moduleId,
        indicatorId,
      );

      // Optimized: Check for existing group questions using the already loaded data
      const existingGroupQuestion = indicator.question_sequences.find(
        (qs) =>
          qs.group_questions &&
          qs.group_questions.name === body.name &&
          !qs.is_deleted,
      );

      if (existingGroupQuestion) {
        throw new BadRequestException(
          'Group question with same name already exists in the indicator',
        );
      }

      // Optimized: Use Set for faster lookups and batch validation
      const questionMap = new Map(
        indicator.standard_questions.map((q) => [q.id, q]),
      );
      const questionIdsSet = new Set(body.standard_question_ids);

      // Batch validation for invalid questions
      const invalidStandardQuestions = body.standard_question_ids
        .filter((id) => !questionMap.has(id))
        .map((id) => ({
          questionId: id,
          error: `Question not found in indicator: ${id}`,
        }));

      // Batch validation for already added sequence questions
      const isAddedSequenceQuestions = body.standard_question_ids
        .map((id) => questionMap.get(id))
        .filter((question) => question && question.is_added_sequence);

      const validStandardQuestions = body.standard_question_ids
        .map((id) => questionMap.get(id))
        .filter((question) => question);

      if (invalidStandardQuestions.length > 0) {
        throw new BadRequestException({
          message: 'Invalid standard questions found',
          invalidStandardQuestions,
        });
      }

      if (isAddedSequenceQuestions.length > 0) {
        throw new BadRequestException({
          message: 'Questions already have sequences',
          isAddedSequenceQuestions,
        });
      }

      // Optimized: Batch validation for rules
      const invalidQuestionsOnRules = [];
      const validQuestionsOnRules = [];
      const invalidOptionsOnRules = [];
      const invalidDependentQuestions = [];

      if (body.rules && body.rules.length > 0) {
        // Batch collect all dependent question IDs for validation
        const allDependentQuestionIds = body.rules.flatMap((rule) =>
          rule.parent_question_options.flatMap(
            (option) => option.dependent_question_ids,
          ),
        );

        // Batch validation for dependent questions
        const invalidDependentQuestionIds = allDependentQuestionIds.filter(
          (id) => !questionIdsSet.has(id),
        );

        if (invalidDependentQuestionIds.length > 0) {
          invalidDependentQuestions.push(
            ...invalidDependentQuestionIds.map((id) => ({
              questionId: id,
              error: `Dependent question ${id} must be one of the standard questions in the group`,
            })),
          );
        }

        // Batch validation for parent questions
        const invalidParentQuestionIds = body.rules
          .map((rule) => rule.parent_question_id)
          .filter((id) => !questionIdsSet.has(id));

        if (invalidParentQuestionIds.length > 0) {
          invalidQuestionsOnRules.push(
            ...invalidParentQuestionIds.map((id) => ({
              questionId: id,
              error: `Parent question ${id} must be one of the standard questions in the group`,
            })),
          );
        }

        // Batch validation for options
        for (const rule of body.rules) {
          if (questionIdsSet.has(rule.parent_question_id)) {
            const question = questionMap.get(rule.parent_question_id);
            if (question) {
              const optionIds = new Set(
                question.standard_question_options.map((opt) => opt.id),
              );
              const invalidOptionIds = rule.parent_question_options
                .map((opt) => opt.question_option_id)
                .filter((id) => !optionIds.has(id));

              if (invalidOptionIds.length > 0) {
                invalidOptionsOnRules.push(
                  ...invalidOptionIds.map((id) => ({
                    questionId: rule.parent_question_id,
                    error: `Option not found for question: ${rule.parent_question_id}`,
                  })),
                );
              } else {
                validQuestionsOnRules.push(question);
              }
            }
          }
        }

        if (invalidQuestionsOnRules.length > 0) {
          throw new BadRequestException({
            message: 'Invalid questions found on rules',
            invalidQuestionsOnRules,
          });
        }

        if (invalidDependentQuestions.length > 0) {
          throw new BadRequestException({
            message: 'Invalid dependent questions found on rules',
            invalidDependentQuestions,
          });
        }

        if (invalidOptionsOnRules.length > 0) {
          throw new BadRequestException({
            message: 'Invalid options found on rules',
            invalidOptionsOnRules,
          });
        }
      }

      const questionSequenceLength = indicator.question_sequences.filter(
        (qs) => !qs.is_deleted,
      ).length;

      const questionSequence = new QuestionSequences();
      questionSequence.standard_indicators = indicator;
      questionSequence.sequence = questionSequenceLength + 1;
      questionSequence.is_dependent = false;
      questionSequence.questable_type = QuestableType.GROUP;
      questionSequence.universal_question_id = '0';

      const groupQuestion = new GroupQuestions();
      groupQuestion.name = body.name;
      groupQuestion.is_multiple = body.max_limit > 1;
      groupQuestion.max_limit = body.max_limit;
      groupQuestion.group_rule = body.rules;

      const groupQuestionSequences = body.standard_question_ids.map(
        (questionId, index) => {
          const question = questionMap.get(questionId); // Use the existing questionMap from earlier

          if (!question) {
            throw new BadRequestException(`Question not found: ${questionId}`);
          }

          const groupQuestionSequence = new GroupQuestionSequences();
          groupQuestionSequence.group_question = groupQuestion;
          groupQuestionSequence.standard_question = question;
          groupQuestionSequence.group_sequence = index + 1; // 1-based sequence (1, 2, 3, 4, 5, 6)
          groupQuestionSequence.is_dependent =
            body.rules && body.rules.length > 0
              ? body.rules.some((rule) =>
                  rule.parent_question_options.some((option) =>
                    option.dependent_question_ids.includes(question.id),
                  ),
                )
              : false;
          groupQuestionSequence.universal_question_id =
            question.universal_question_id;
          return groupQuestionSequence;
        },
      );

      // Optimized: Execute database operations in correct order to avoid constraint violations
      // First save the GroupQuestions entity
      const savedGroupQuestion = await queryRunner.manager.save(
        GroupQuestions,
        groupQuestion,
      );

      // Set the relationship and save QuestionSequences
      questionSequence.group_questions = savedGroupQuestion;
      const savedQuestionSequence = await queryRunner.manager.save(
        QuestionSequences,
        questionSequence,
      );

      // Execute remaining operations in parallel
      await Promise.all([
        queryRunner.manager.save(
          GroupQuestionSequences,
          groupQuestionSequences,
        ),
        queryRunner.manager
          .createQueryBuilder()
          .update(StandardQuestion)
          .set({ is_added_sequence: true })
          .where('id IN (:...ids)', { ids: body.standard_question_ids })
          .execute(),
      ]);

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Group question created successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || error);
    } finally {
      await queryRunner.release();
    }
  }

  async removeQuestionRules(
    standardId: string,
    moduleId: string,
    indicatorId: string,
    questionSequenceId: string,
    body: RemoveQuestionRulesDto,
  ) {
    try {
      const { indicator } = await this.validateStandardModuleIndicatorRelation(
        standardId,
        moduleId,
        indicatorId,
      );

      const questionSequence = indicator.question_sequences.find(
        (qs) => qs.id === questionSequenceId,
      );

      if (!questionSequence) {
        throw new BadRequestException('Question sequence not found');
      }

      const existingRuleIds = new Set(
        questionSequence.question_rules.map((qr) => qr.id),
      );

      const notFoundRuleIds = body.question_rules_ids.filter(
        (id) => !existingRuleIds.has(id),
      );

      if (notFoundRuleIds.length > 0) {
        throw new BadRequestException(
          `Question rules not found for IDs: ${notFoundRuleIds.join(', ')}`,
        );
      }

      await this.dataSource.manager
        .getRepository(QuestionSequences)
        .update({ id: questionSequenceId }, { is_dependent: false });
      await this.dataSource.manager.getRepository(QuestionRules).delete({
        id: In(body.question_rules_ids),
      });

      return { success: true, message: 'Question rules removed successfully' };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }
}
