/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageModule } from './file-storage/file-storage.module';
import { MailModule } from './mail/mail.module';
import { StandardModulesModule } from './modules/base/standards/standard_modules/standard_module.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { AccountModule } from './modules/tenanted/account/account.module';
import { AuthModule } from './modules/tenanted/auth/auth.module';
import { BusinessUnitModule } from './modules/tenanted/businessunit/businessunit.module';
import { RoleModule } from './modules/tenanted/roles/role.module';
import { SiteModule } from './modules/tenanted/sites/sites.module';
import { AdminAccountModule } from './modules/base/accounts/account.module';
import { AdminAuthModule } from './modules/base/auth/auth.module';
import { IndustriesModule } from './modules/base/industries/industries.module';
import { IndicatorModule } from './modules/base/masters/indicators/indicator.module';
import { ModuleModule } from './modules/base/masters/modules/module.module';
import { QuestionModule } from './modules/base/masters/questions/question.module';
import { SubIndicatorModule } from './modules/base/masters/sub-indicators/sub-indicator.module';
import { AdminRoleModule } from './modules/base/roles/role.module';
import { SectorsModule } from './modules/base/sectors/sectors.module';
import { StandardModule } from './modules/base/standards/standard.module';
import { StandardIndicatorModule } from './modules/base/standards/standard_indicators/standard_indicator.module';
import { GroupQuestionsModule } from './modules/base/standards/standard_questions/group_questions/group_question.module';
import { QuestionRulesModule } from './modules/base/standards/standard_questions/question_sequences/question_rules/question_rule.module';
import { QuestionSequenceModule } from './modules/base/standards/standard_questions/question_sequences/question_sequence.module';
import { StandardQuestionModule } from './modules/base/standards/standard_questions/standard_question.module';
import { StandardQuestionOptionModule } from './modules/base/standards/standard_questions/standard_question_options/standard_question_option.module';
import { AdminUserModule } from './modules/base/users/user.module';
import { DatacubeModule } from './modules/tenanted/datacubes/datacube.module';
import { TenentSectorModule } from './modules/tenanted/tenentsectors/sector.module';
import { UserModule } from './modules/tenanted/user/user.module';
import * as ormConfig from './orm_config/orm.config';
import { TaskModule } from './modules/tenanted/datacubes/task/task.module';
import { DepartmentModule } from './modules/base/masters/departments/department.module';
import { WidgetModule } from './modules/base/widgets/widget.module';
import { StandardTemplateModule } from './modules/base/standards/standard_templates/standard_template.module';
import { DashboardModule } from './modules/base/dashboard/dashboard.module';
import { ReportTemplateModule } from './modules/tenanted/reports/report.module';
import { DisclosureModule } from './modules/tenanted/disclosure/disclosure.module';
import { ChatbotModule } from './modules/tenanted/chatbot/chatbot.module';
import { ConsolidatedResponseModule } from './modules/tenanted/consolidated/consolidated_response.module';
import { CustomDashboardModule } from './modules/tenanted/customdashboard/customdashboard.module';
import { CustomChartModule } from './modules/tenanted/customdashboard/customcharts/customcharts.module';
import { TenantActivityModule } from './modules/tenanted/activitylog/tenantactivity.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    AccountModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    TenancyModule,
    MailModule,
    forwardRef(() => AdminAuthModule),
    AdminUserModule,
    AdminRoleModule,
    AdminAccountModule,
    FileStorageModule,
    SectorsModule,
    IndustriesModule,
    StandardModule,
    RoleModule,
    SubIndicatorModule,
    DepartmentModule,
    DashboardModule,
    WidgetModule,
    StandardTemplateModule,
    SiteModule,
    BusinessUnitModule,
    TenentSectorModule,
    StandardModule,
    QuestionModule,
    StandardModulesModule,
    StandardIndicatorModule,
    StandardQuestionModule,
    StandardQuestionOptionModule,
    ModuleModule,
    IndicatorModule,
    GroupQuestionsModule,
    QuestionSequenceModule,
    QuestionRulesModule,
    DatacubeModule,
    TaskModule,
    ReportTemplateModule,
    DisclosureModule,
    ChatbotModule,
    ConsolidatedResponseModule,
    CustomDashboardModule,
    CustomChartModule,
    TenantActivityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
