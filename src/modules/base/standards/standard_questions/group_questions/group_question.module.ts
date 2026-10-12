import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupQuestions } from './group_question.entity';
import { GroupQuestionSequences } from './group_question_sequence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupQuestionSequences, GroupQuestions])],
  controllers: [],
  providers: [],
})
export class GroupQuestionsModule {}
