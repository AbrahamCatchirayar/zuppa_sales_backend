import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestableType, QuestionType } from 'src/enum/questiontype.enum';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { DataSource, Repository } from 'typeorm';
import { Datacube } from '../datacubes/datacube.entity';
import { DataCubeQuestionOption } from '../datacubes/questions/question_options/question_option.entity';
import { DataCubeTask } from '../datacubes/task/task.entity';
import { TaskService } from '../datacubes/task/task.serivce';
import { TaskQuestion } from '../datacubes/task/task_questions.entity';
import { TaskQuestionAnswer } from '../datacubes/task/task_question_answer.entity';
import { AllResponse } from './allresponse.entity';

import { ConsolidatedResponse } from './consolidated_response.entity';

@Injectable()
export class ConsolidatedResponseService {
  constructor(
    @InjectRepository(ConsolidatedResponse)
    private readonly consolidatedResponseRepository: Repository<ConsolidatedResponse>,
    @InjectRepository(AllResponse)
    private readonly allResponseRepository: Repository<AllResponse>,
    @InjectRepository(DataCubeTask)
    private readonly dataCubeTaskRepository: Repository<DataCubeTask>,
    @InjectRepository(TaskQuestion)
    private readonly taskQuestionRepository: Repository<TaskQuestion>,
    @InjectRepository(TaskQuestionAnswer)
    private readonly taskQuestionAnswerRepository: Repository<TaskQuestionAnswer>,
    @Inject(CONNECTION)
    private readonly connection: DataSource,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {
    this.consolidatedResponseRepository =
      connection.getRepository(ConsolidatedResponse);
    this.allResponseRepository = connection.getRepository(AllResponse);
  }

  async createConsolidatedResponse(taskId: string) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const task = await queryRunner.manager
        .getRepository(DataCubeTask)
        .findOne({
          where: { id: taskId },
          relations: ['datacube_frequency.datacube', 'site'],
        });
      if (!task) {
        throw new BadRequestException('Task not found');
      }

      const taskQuestions = await queryRunner.manager
        .getRepository(TaskQuestion)
        .find({
          where: { task: { id: taskId } },
          relations: [
            'task_question_answers',
            'task_question_answers.datacube_question',
            'question_sequence.datacube_question.mixed_questions',
            'question_sequence.group_question_rule',
            'question_sequence.question_rules_id',
            'task.datacube_frequency.datacube',
            'task.site',
          ],
        });
      if (!taskQuestions || taskQuestions.length === 0) {
        throw new BadRequestException('Task questions not found');
      }

      for (const taskQuestion of taskQuestions) {
        for (const taskQuestionAnswer of taskQuestion.task_question_answers) {
          const questionType = taskQuestionAnswer.datacube_question
            ?.question_type as QuestionType;

          const ruleQuestionId = Array.isArray(
            taskQuestion.question_sequence.question_rules_id,
          )
            ? taskQuestion.question_sequence.question_rules_id[0]
            : taskQuestion.question_sequence.question_rules_id;

          // Save to AllResponse table
          await queryRunner.manager.getRepository(AllResponse).insert({
            question_type: questionType,
            questable_type: QuestableType.STANDARD,
            universal_question_id: taskQuestion.universal_question_id,
            group_questions_rule_id:
              taskQuestion.question_sequence.group_question_rule,
            rule_question_id: ruleQuestionId,
            answer: Array.isArray(taskQuestionAnswer.answer)
              ? taskQuestionAnswer.answer.join(', ')
              : taskQuestionAnswer.answer,
            datacube: taskQuestion.task.datacube_frequency.datacube,
            site: taskQuestion.task.site,
            datacubefrequency: taskQuestion.task.datacube_frequency,
          });

          // Save to ConsolidatedResponse table with proper consolidation logic
          const answerString = Array.isArray(taskQuestionAnswer.answer)
            ? taskQuestionAnswer.answer.join(', ')
            : taskQuestionAnswer.answer;
          // Apply is_latest_data rules: monthly -> only March, quarterly -> only Q4, yearly -> always
          const isLatestData =
            !!taskQuestionAnswer.datacube_question?.is_latest_data;
          const frequencyNameRaw =
            taskQuestion.task?.datacube_frequency?.frequency_name || '';
          const frequencyName = (frequencyNameRaw || '')
            .toString()
            .toUpperCase()
            .trim();
          let shouldConsolidate = true;

          if (isLatestData) {
            // Heuristics to determine frequency category
            const isYearly = frequencyName.includes('YEAR');
            const isQuarterly =
              /\bQ[1-4]\b/.test(frequencyName) ||
              frequencyName.includes('QUARTER');
            if (isYearly) {
              shouldConsolidate = true; // yearly has no special condition
            } else if (isQuarterly) {
              // Only take Q4
              shouldConsolidate =
                /\bQ4\b/.test(frequencyName) ||
                frequencyName.endsWith(' Q4') ||
                frequencyName === 'Q4';
            } else {
              // Treat as monthly: only take March
              // Match common representations: 'MAR', 'MARCH', or month number 03 in various formats
              const isMarchByName =
                frequencyName.includes('MARCH') ||
                /\bMAR\b/.test(frequencyName);
              const isMarchByNumber = /(^|[^\d])0?3([^\d]|$)/.test(
                frequencyName,
              );
              shouldConsolidate = isMarchByName || isMarchByNumber;
            }
          }

          if (shouldConsolidate) {
            await this.saveConsolidatedResponse(
              questionType,
              QuestableType.STANDARD,
              taskQuestion.universal_question_id,
              answerString,
              taskQuestion.task.datacube_frequency.datacube,
            );
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating consolidated response:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async saveConsolidatedResponse(
    questionType: QuestionType,
    questableType: QuestableType,
    universalQuestionId: string,
    answerString: string,
    datacube: Datacube,
  ) {
    // Check if existing consolidated response exists
    const existingResponse = await this.consolidatedResponseRepository.findOne({
      where: {
        universal_question_id: universalQuestionId,
        datacube: { id: datacube.id },
      },
    });

    if (
      questionType === QuestionType.TEXT ||
      questionType === QuestionType.DATE ||
      questionType === QuestionType.URL ||
      questionType === QuestionType.File
    ) {
      // For text, date, URL, and file types - concatenate with existing response
      if (existingResponse) {
        await this.consolidatedResponseRepository.update(
          { id: existingResponse.id },
          {
            consolidated_response: `${existingResponse.consolidated_response},${answerString}`,
          },
        );
        return existingResponse;
      }
      const consolidatedResponse =
        await this.consolidatedResponseRepository.save({
          question_type: questionType,
          questable_type: questableType,
          universal_question_id: universalQuestionId,
          consolidated_response: answerString,
          datacube,
        });
      return consolidatedResponse;
    }
    if (
      questionType === QuestionType.NUMBER ||
      questionType === QuestionType.MIXED_TYPE
    ) {
      // For number and mixed types - sum the values
      const currentAnswer = parseFloat(answerString);

      if (existingResponse) {
        const existingValue =
          parseFloat(existingResponse.consolidated_response) || 0;
        const newValue = existingValue + currentAnswer;

        await this.consolidatedResponseRepository.update(
          { id: existingResponse.id },
          {
            consolidated_response: newValue.toString(),
          },
        );
        return existingResponse;
      }
      const consolidatedResponse =
        await this.consolidatedResponseRepository.save({
          question_type: questionType,
          questable_type: questableType,
          universal_question_id: universalQuestionId,
          consolidated_response: currentAnswer.toString(),
          datacube,
        });
      return consolidatedResponse;
    }
    if (
      questionType === QuestionType.MULTI_SELECT ||
      questionType === QuestionType.SINGLE_SELECT
    ) {
      // For select types - concatenate with existing response
      if (existingResponse) {
        const optionText = await this.connection
          .getRepository(DataCubeQuestionOption)
          .findOne({
            where: { id: answerString },
          });
        if (optionText) {
          answerString = optionText.text;
        }
        await this.consolidatedResponseRepository.update(
          { id: existingResponse.id },
          {
            consolidated_response: `${existingResponse.consolidated_response},${answerString}`,
          },
        );
        return existingResponse;
      }
      const optionText = await this.connection
        .getRepository(DataCubeQuestionOption)
        .findOne({
          where: { id: answerString },
        });
      if (optionText) {
        answerString = optionText.text;
      }
      const consolidatedResponse =
        await this.consolidatedResponseRepository.save({
          question_type: questionType,
          questable_type: questableType,
          universal_question_id: universalQuestionId,
          consolidated_response: answerString,
          datacube,
        });
      return consolidatedResponse;
    }
  }
}
