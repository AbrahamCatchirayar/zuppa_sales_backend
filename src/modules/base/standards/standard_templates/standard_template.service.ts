import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Standard } from '../standard.entity';
import { StandardTemplate } from './standard_template.entity';
import { StandardTemplateDto } from './standard_template.dto';
import { StandardTemplateQuestion } from './standard_template_questions.entity';

@Injectable()
export class StandardTemplateService {
  constructor(
    @InjectRepository(StandardTemplate)
    private readonly templateModule: Repository<StandardTemplate>,
    private readonly dataSource: DataSource,
  ) {}

  async getStandardTemplates(param: any) {
    try {
      const { page, limit, sort, search } = param;

      const whereCondition: any = {
        is_deleted: false,
      };

      const query = {
        take: limit,
        // skip: (Number(page) - 1) * Number(limit),
        order: sort,
        where: whereCondition,
        relations: ['standard', 'standard_template_question'],
      };

      if (search) {
        query.where = {
          ...query.where,
          standard: { name: ILike(`%${search}%`) },
        };
      }
      const [data, totalCount] = await this.templateModule.findAndCount(query);

      return {
        success: true,
        Templates: data,
        meta: {
          currentCount: data.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addQuestions(params: StandardTemplateDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const standard = await queryRunner.manager
        .getRepository(Standard)
        .findOne({ where: { id: params.standard_id } });
      if (!standard) {
        throw new BadRequestException('Invalid Standard');
      }

      let standardTemplate = await queryRunner.manager
        .getRepository(StandardTemplate)
        .findOne({
          where: { standard: { id: standard.id } },
        });

      if (!standardTemplate) {
        standardTemplate = await queryRunner.manager
          .getRepository(StandardTemplate)
          .save({
            standard,
          });

        for (const templateQuestion of params.standard_template_question) {
          const title = templateQuestion.question_title;
          const question = await queryRunner.manager
            .getRepository(StandardTemplateQuestion)
            .findOne({
              where: { question_title: title },
            });
          if (question) {
            throw new BadRequestException('Question already exists');
          }
          const questionData = {
            question_title: templateQuestion.question_title,
            standard_questions: templateQuestion.standard_question,
            consolidated_answer: null,
            macro_function: templateQuestion.macro_function,
            unit: templateQuestion.unit_value,
            emission_value: templateQuestion.emission_value,
            is_previous_year: templateQuestion.is_previous_year,
            is_prior_year: templateQuestion.is_prior_year,
            standard_template: standardTemplate,
          };
          await queryRunner.manager
            .getRepository(StandardTemplateQuestion)
            .save(questionData);
        }
      } else {
        for (const templateQuestion of params.standard_template_question) {
          const title = templateQuestion.question_title;
          const question = await queryRunner.manager
            .getRepository(StandardTemplateQuestion)
            .findOne({
              where: { question_title: title },
            });
          if (question) {
            throw new BadRequestException(
              `Question already exists: ${question.question_title}`,
            );
          }
          const questionData = {
            question_title: templateQuestion.question_title,
            standard_questions: templateQuestion.standard_question,
            consolidated_answer: null,
            macro_function: templateQuestion.macro_function,
            unit: templateQuestion.unit_value,
            emission_value: templateQuestion.emission_value,
            is_previous_year: templateQuestion.is_previous_year,
            is_prior_year: templateQuestion.is_prior_year,
            standard_template: standardTemplate,
          };
          await queryRunner.manager
            .getRepository(StandardTemplateQuestion)
            .save(questionData);
        }
      }
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Template question added successfully',
        // data: question,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
