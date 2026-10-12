import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandardQuestion } from './standard_question.entity';
import { StandardIndicatorModule } from '../standard_indicators/standard_indicator.module';
import { StandardQuestionService } from './standard_question.service';
import { StandardQuestionController } from './standard_question.controller';
import { StandardModule } from '../standard.module';
import { StandardMixedQuestions } from './standard_mixed_questions/standard_mixed_question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StandardQuestion, StandardMixedQuestions]),
    StandardIndicatorModule,
    StandardModule,
  ],
  controllers: [StandardQuestionController],
  providers: [StandardQuestionService],
  exports: [StandardQuestionService],
})
export class StandardQuestionModule {}
