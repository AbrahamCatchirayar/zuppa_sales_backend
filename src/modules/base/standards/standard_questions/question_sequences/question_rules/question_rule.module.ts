import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionRules } from './question_rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionRules])],
  controllers: [],
  providers: [],
})
export class QuestionRulesModule {}
