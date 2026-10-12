import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Indicator } from '../indicators/indicator.entity';
import { IndicatorModule } from '../indicators/indicator.module';
import { SubIndicator } from '../sub-indicators/sub-indicator.entity';
import { MixedTypeQuestion } from './mixed_type_question.entity';
import { Question } from './question.entity';
import { MasterQuestionService } from './question.service';
import { MasterQuestionsController } from './question.controller';
import { QuestionOption } from './question_option.entity';
import { Department } from '../departments/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      Indicator,
      SubIndicator,
      QuestionOption,
      MixedTypeQuestion,
      Department,
    ]),
    forwardRef(() => IndicatorModule),
  ],
  controllers: [MasterQuestionsController],
  providers: [MasterQuestionService],
  exports: [MasterQuestionService],
})
export class QuestionModule {}
