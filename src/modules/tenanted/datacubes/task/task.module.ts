import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from '../../auth/auth.module';
import { ConsolidatedResponseModule } from '../../consolidated/consolidated_response.module';
import { DataCubeGroupQuestionsRule } from '../questions/group_questions/group_question.entity';
import { DataCubeMixedTypeQuestion } from '../questions/mixed_questions/mixed_question.entity';
import { DataCubeQuestion } from '../questions/question.entity';
import { DataCubeQuestionOption } from '../questions/question_options/question_option.entity';
import { DataCubeQuestionRules } from '../questions/question_sequences/question_rules/question_rule.entity';
import { TaskContoller } from './task.controller';
import { DataCubeTask } from './task.entity';
import { TaskService } from './task.serivce';
import { TaskComments } from './task_comments.entity';
import { TaskQuestion } from './task_questions.entity';
import { TaskQuestionAnswer } from './task_question_answer.entity';
import { TenantActivityModule } from '../../activitylog/tenantactivity.module';
import { TenantActivity } from '../../activitylog/tenantactivity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DataCubeTask,
      TaskQuestion,
      TaskQuestionAnswer,
      TaskComments,
      DataCubeGroupQuestionsRule,
      DataCubeQuestionRules,
      DataCubeQuestionOption,
      DataCubeMixedTypeQuestion,
      DataCubeQuestion,
      TenantActivity,
    ]),
    AuthModule,
    FileStorageModule,
    MailModule,
    TenantActivityModule,
    forwardRef(() => ConsolidatedResponseModule),
  ],
  controllers: [TaskContoller],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
