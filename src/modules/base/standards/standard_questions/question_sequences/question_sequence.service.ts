/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuestableType, QuestionType } from 'src/enum/questiontype.enum';
import { DataSource, Repository } from 'typeorm';
import { Standard } from '../../standard.entity';
import { StandardIndicator } from '../../standard_indicators/standard_indicator.entity';
import { StandardModule } from '../../standard_modules/standard_module.entity';
import { StandardQuestion } from '../standard_question.entity';
import { QuestionRules } from './question_rules/question_rule.entity';
// import { StandardQuestionOption } from '../standard_question_options/standard_question_option.entity';
import { GroupQuestions } from '../group_questions/group_question.entity';
import { GroupQuestionSequences } from '../group_questions/group_question_sequence.entity';
import { QuestionSequences } from './question_sequence.entity';
import { CreateQuestionSequenceDto } from './question_sequence.dto';

@Injectable()
export class QuestionSequenceService {
  constructor(
    @InjectRepository(QuestionSequences)
    private questionSequenceRepository: Repository<QuestionSequences>,

    @InjectDataSource()
    private readonly connection: DataSource,
  ) {}

  async createQuestionSequence(
    standardId: string,
    moduleId: string,
    indicatorId: string,
    body: CreateQuestionSequenceDto,
  ) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch all required entities in parallel
      const [standard, module, indicator, standardQuestion] = await Promise.all(
        [
          queryRunner.manager.findOne(Standard, { where: { id: standardId } }),
          queryRunner.manager.findOne(StandardModule, {
            where: { id: moduleId },
          }),
          queryRunner.manager.findOne(StandardIndicator, {
            where: { id: indicatorId },
          }),
          queryRunner.manager.findOne(StandardQuestion, {
            where: { id: body.questions },
            relations: ['mixed_questions', 'standard_question_options'],
          }),
        ],
      );

      // Validate all required entities exist
      if (!standard) throw new BadRequestException('Standard not found');
      if (!module) throw new BadRequestException('Module not found');
      if (!indicator) throw new BadRequestException('Indicator not found');
      if (!standardQuestion)
        throw new BadRequestException('Standard question not found');

      const isGroup = body.question_type === QuestableType.GROUP;

      // Get the latest sequence number for this indicator
      const latestSequence = await queryRunner.manager.findOne(
        QuestionSequences,
        {
          where: { standard_indicators: { id: indicatorId } },
          relations: ['standard_indicators'],
          order: { sequence: 'DESC' },
        },
      );

      // Create base question sequence
      const questionSequence = new QuestionSequences();
      questionSequence.questable_type = body.question_type;
      questionSequence.is_dependent = body.dependent_to;
      questionSequence.standard_indicators = indicator;
      questionSequence.standard_question_id = standardQuestion;
      questionSequence.sequence = latestSequence
        ? latestSequence.sequence + 1
        : 1;
      questionSequence.universal_question_id =
        standardQuestion.universal_question_id;

      // Handle dependent questions if needed
      if (body.dependent_to && body.rules) {
        // Fetch all dependent questions and options in parallel
        const dependentEntities = await Promise.all(
          body.rules.map(async (rule) => {
            const [question, dependentQuestion] = await Promise.all([
              queryRunner.manager.findOne(StandardQuestion, {
                where: { id: rule.dependent_question_id },
                relations: ['mixed_questions', 'standard_question_options'],
              }),
              queryRunner.manager.findOne(StandardQuestion, {
                where: { id: body.questions },
                relations: ['mixed_questions', 'standard_question_options'],
              }),
            ]);

            if (!question)
              throw new BadRequestException(
                `Dependent question ${rule.dependent_question_id} not found`,
              );

            if (!dependentQuestion)
              throw new BadRequestException(
                `Dependent question ${rule.dependent_question_id} not found`,
              );

            // Handle mixed type questions
            if (
              question.question_type.toUpperCase() ===
              QuestionType.MIXED_TYPE.toUpperCase()
            ) {
              const mixedQuestion = question.mixed_questions?.find(
                (mq) => mq.id === rule.dependent_option_id,
              );
              if (!mixedQuestion) {
                throw new BadRequestException(
                  `Mixed question option ${rule.dependent_option_id} not found`,
                );
              }
              const questionRule = new QuestionRules();
              questionRule.dependent_question_sequence_id = questionSequence;
              questionRule.parent_question_id = question;
              questionRule.parent_option_id = null; // Since we're using mixed questions, we don't need an option
              return questionRule;
            }
            // Handle regular question options
            const option = question.standard_question_options?.find(
              (o) => o.id === rule.dependent_option_id,
            );
            if (!option) {
              throw new BadRequestException(
                `Dependent option ${rule.dependent_option_id} not found`,
              );
            }
            const questionRule = new QuestionRules();
            questionRule.dependent_question_sequence_id = questionSequence;
            questionRule.parent_question_id = question;
            questionRule.parent_option_id = option;
            return questionRule;
          }),
        );

        questionSequence.question_rules = dependentEntities;
      }

      // Handle mixed type questions if needed
      if (
        standardQuestion.question_type.toUpperCase() ===
        QuestionType.MIXED_TYPE.toUpperCase()
      ) {
        // Validate that the question has mixed questions
        if (
          !standardQuestion.mixed_questions ||
          standardQuestion.mixed_questions.length === 0
        ) {
          throw new BadRequestException(
            'Mixed type question must have sub-questions',
          );
        }
      }

      // Handle group questions if needed
      if (isGroup && body.group_questions) {
        // Create group question rule
        const groupQuestionRule = new GroupQuestions();
        groupQuestionRule.is_multiple = body.group_questions.is_multiple;
        groupQuestionRule.max_limit = body.group_questions.max_limit;
        groupQuestionRule.group_rule = body.group_questions.group_rule;

        // Save group question rule first
        await queryRunner.manager.save(groupQuestionRule);
        questionSequence.group_questions = groupQuestionRule;

        // Fetch all standard questions for group in parallel
        const groupStandardQuestions = await Promise.all(
          body.group_questions.standard_questions.map((id) =>
            queryRunner.manager.findOne(StandardQuestion, {
              where: { id },
              relations: ['mixed_questions', 'standard_question_options'],
            }),
          ),
        );

        // Validate all group questions exist
        if (groupStandardQuestions.some((q) => !q)) {
          throw new BadRequestException(
            'One or more standard questions not found',
          );
        }

        // Create group questions
        const groupQuestions = groupStandardQuestions.map(
          (groupStandardQuestion) => {
            const groupQuestion = new GroupQuestionSequences();
            groupQuestion.standard_question = groupStandardQuestion;
            groupQuestion.group_question = groupQuestionRule;
            return groupQuestion;
          },
        );

        // Save group questions
        await queryRunner.manager.save(groupQuestions);
      }

      // Save the question sequence and all related entities
      await queryRunner.manager.save(questionSequence);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Question sequence created successfully',
        data: questionSequence,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error?.message || 'Failed to create question sequence',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getQuestionSequencesByIndicatorId(
    standardId: string,
    moduleId: string,
    indicatorId: string,
  ) {
    try {
      // const sequencess = await this.questionSequenceRepository.find({
      //   relations: ['group_questions', 'standard_question', 'question_rules'],
      // });

      // return { questionSequence: sequencess };

      const standard = await this.connection.manager.findOne(Standard, {
        where: { id: standardId },
        relations: ['standard_modules', 'standard_modules.standard_indicators'],
      });
      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      const module = standard.standard_modules.find((m) => m.id === moduleId);
      if (!module) {
        throw new BadRequestException('Module not found in this standard');
      }

      const indicator = module.standard_indicators.find(
        (i) => i.id === indicatorId,
      );
      if (!indicator) {
        throw new BadRequestException('Indicator not found in this module');
      }

      const sequences = await this.questionSequenceRepository.find({
        where: { standard_indicators: { id: indicatorId } },
        relations: [
          'standard_question',
          'standard_question.standard_question_options',
          'standard_question.mixed_questions',
          'question_rules',
          'question_rules.dependent_question_id',
          'question_rules.dependent_option_id',
          'question_rules.dependent_mixed_option_id',
          'group_question_rule',
          'standard_indicators',
          'standard_indicators.standard_modules_id',
          'standard_indicators.standard_modules_id.standard_id',
        ],
        order: { sequence: 'ASC' },
      });

      if (sequences.length === 0) {
        throw new BadRequestException('No sequences found for this indicator');
      }

      const formattedSequences = sequences.map((sequence) => {
        const baseQuestion = {
          id: sequence.id,
          sequence: sequence.sequence,
          question: sequence.standard_question_id,
          type: sequence.questable_type,
        };

        // Handle mixed type questions
        if (
          sequence.standard_question_id?.question_type.toUpperCase() ===
          QuestionType.MIXED_TYPE.toUpperCase()
        ) {
          return {
            ...baseQuestion,
            is_mixed: true,
            mixed_questions: sequence.standard_question_id.mixed_questions,
          };
        }

        // Handle dependent questions
        if (sequence.is_dependent && sequence.question_rules?.length > 0) {
          return {
            ...baseQuestion,
            dependent_questions: sequence.question_rules.map((rule) => ({
              question: rule.parent_question_id,
              option: rule.parent_option_id,
            })),
          };
        }

        // Handle group questions
        if (
          sequence.questable_type.toUpperCase() ===
          QuestableType.GROUP.toUpperCase()
        ) {
          return {
            ...baseQuestion,
            is_group: true,
            group_rule: sequence.group_questions,
          };
        }

        return baseQuestion;
      });

      return {
        success: true,
        data: formattedSequences,
      };
    } catch (error) {
      throw new BadRequestException(error?.message || error);
    }
  }

  async deleteQuestionSequence(
    standardId: string,
    moduleId: string,
    indicatorId: string,
    questionSequenceId: string,
  ) {
    try {
      const standard = await this.connection.manager.findOne(Standard, {
        where: { id: standardId },
        relations: [
          'standard_modules',
          'standard_modules.standard_indicators',
          'standard_modules.standard_indicators.question_sequences',
        ],
      });
      if (!standard) {
        throw new BadRequestException('Standard not found');
      }

      const module = standard.standard_modules.find((m) => m.id === moduleId);
      if (!module) {
        throw new BadRequestException('Module not found in this standard');
      }

      const indicator = module.standard_indicators.find(
        (i) => i.id === indicatorId,
      );
      if (!indicator) {
        throw new BadRequestException('Indicator not found in this module');
      }

      const questionSequence = indicator.question_sequences.find(
        (qs) => qs.id === questionSequenceId,
      );
      if (!questionSequence) {
        throw new BadRequestException(
          'Question sequence not found in this indicator',
        );
      }

      await this.questionSequenceRepository.update(questionSequence.id, {
        is_deleted: true,
        deleted_at: new Date(),
      });

      return {
        success: true,
        message: 'Question sequence deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error?.message || error);
    }
  }
}
