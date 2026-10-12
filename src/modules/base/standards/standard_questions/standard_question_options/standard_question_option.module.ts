import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandardQuestionOption } from './standard_question_option.entity';
import { StandardQuestionModule } from '../standard_question.module';
import { StandardQuestionOptionService } from './standard_question_option.service';
import { StandardQuestionOptionController } from './standard_question_option.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StandardQuestionOption]),
    StandardQuestionModule,
  ],
  controllers: [StandardQuestionOptionController],
  providers: [StandardQuestionOptionService],
  exports: [StandardQuestionOptionService],
})
export class StandardQuestionOptionModule {}
