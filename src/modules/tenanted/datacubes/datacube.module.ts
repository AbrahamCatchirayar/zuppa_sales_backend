import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { Widget } from 'src/modules/base/widgets/entities/widget.entity';
import { WidgetBlock } from 'src/modules/base/widgets/entities/widget_block.entity';
import { WidgetColumn } from 'src/modules/base/widgets/entities/widget_column.entity';
import { WidgetItem } from 'src/modules/base/widgets/entities/widget_item.entity';
import { WidgetType } from 'src/modules/base/widgets/entities/widget_type.entity';
import { Department } from 'src/modules/base/masters/departments/department.entity';
import { Dashboard } from 'src/modules/base/dashboard/entities/dashboard.entity';
import { DashboardBlock } from 'src/modules/base/dashboard/entities/dashboard_block.entity';
import { DashboardColumn } from 'src/modules/base/dashboard/entities/dashboard_column.entity';
import { DashboardCombinedParameter } from 'src/modules/base/dashboard/entities/dashboard_combined_parameter.entity';
import { DashboardCustomParameter } from 'src/modules/base/dashboard/entities/dashboard_custom_parameter.entity';
import { DashboardType } from 'src/modules/base/dashboard/entities/dashboard_type.entity';
import { DashboardItem } from 'src/modules/base/dashboard/entities/dashboard_item.entity';
import { AuthModule } from '../auth/auth.module';
import { Site } from '../sites/sites.entity';
import { DataCubeController } from './datacube.controller';
import { Datacube } from './datacube.entity';
import { DataCubeService } from './datacube.service';
import { DataCubeConfig } from './datacube_config.entity';
import { DataCubeFrequency } from './datacube_frequency.entity';
import { DataCubeGroupQuestionsRule } from './questions/group_questions/group_question.entity';
import { DataCubeGroupQuestions } from './questions/group_questions/group_question_sequence.entity';
import { DataCubeMixedTypeQuestion } from './questions/mixed_questions/mixed_question.entity';
import { DataCubeQuestion } from './questions/question.entity';
import { DataCubeQuestionOption } from './questions/question_options/question_option.entity';
import { DataCubeQuestionRules } from './questions/question_sequences/question_rules/question_rule.entity';
import { DataCubeQuestionSequences } from './questions/question_sequences/question_sequence.entity';
import { DataCubeTask } from './task/task.entity';
import { TaskComments } from './task/task_comments.entity';
import { TaskQuestion } from './task/task_questions.entity';
import { TaskQuestionAnswer } from './task/task_question_answer.entity';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { TenantActivityModule } from '../activitylog/tenantactivity.module';
import { TenantActivity } from '../activitylog/tenantactivity.entity';
import { TenantActivityService } from '../activitylog/tenantactivity.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Datacube,
      DataCubeFrequency,
      DataCubeConfig,
      DataCubeQuestion,
      DataCubeQuestionSequences,
      DataCubeQuestionRules,
      DataCubeQuestionOption,
      DataCubeGroupQuestions,
      DataCubeGroupQuestionsRule,
      DataCubeMixedTypeQuestion,
      DataCubeTask,
      TaskQuestion,
      TaskQuestionAnswer,
      TaskComments,
      Site,
      Department,
      Dashboard,
      Widget,
      WidgetBlock,
      WidgetColumn,
      WidgetType,
      WidgetItem,
      DashboardBlock,
      DashboardColumn,
      DashboardCombinedParameter,
      DashboardCustomParameter,
      DashboardType,
      DashboardItem,
      TenantActivity,
    ]),
    AuthModule,
    MailModule,
    ChatbotModule,
    TenantActivityModule,
  ],
  controllers: [DataCubeController],
  providers: [DataCubeService, TenantActivityService],
  exports: [DataCubeService],
})
export class DatacubeModule {}
