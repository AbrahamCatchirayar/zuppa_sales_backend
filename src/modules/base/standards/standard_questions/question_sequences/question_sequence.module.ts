import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionSequences } from './question_sequence.entity';
import { QuestionSequenceController } from './question_sequence.controller';
import { QuestionSequenceService } from './question_sequence.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionSequences])],
  controllers: [QuestionSequenceController],
  providers: [QuestionSequenceService],
  exports: [QuestionSequenceService],
})
export class QuestionSequenceModule {}
