import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AdminAccountModule } from 'src/modules/base/accounts/account.module';
import { AdminAuthModule } from 'src/modules/base/auth/auth.module';
import { DashboardModule } from 'src/modules/base/dashboard/dashboard.module';
import { IndustriesModule } from 'src/modules/base/industries/industries.module';
import { DepartmentModule } from 'src/modules/base/masters/departments/department.module';
import { IndicatorModule } from 'src/modules/base/masters/indicators/indicator.module';
import { ModuleModule } from 'src/modules/base/masters/modules/module.module';
import { QuestionModule } from 'src/modules/base/masters/questions/question.module';
import { QuestionOption } from 'src/modules/base/masters/questions/question_option.entity';
import { SubIndicatorModule } from 'src/modules/base/masters/sub-indicators/sub-indicator.module';
import { SectorsModule } from 'src/modules/base/sectors/sectors.module';
import { StandardModule } from 'src/modules/base/standards/standard.module';
import { StandardIndicatorModule } from 'src/modules/base/standards/standard_indicators/standard_indicator.module';
import { StandardModulesModule } from 'src/modules/base/standards/standard_modules/standard_module.module';
import { QuestionSequenceModule } from 'src/modules/base/standards/standard_questions/question_sequences/question_sequence.module';
import { StandardQuestionModule } from 'src/modules/base/standards/standard_questions/standard_question.module';
import { StandardQuestionOptionModule } from 'src/modules/base/standards/standard_questions/standard_question_options/standard_question_option.module';
import { StandardTemplateModule } from 'src/modules/base/standards/standard_templates/standard_template.module';
import { AdminUserModule } from 'src/modules/base/users/user.module';
import { WidgetModule } from 'src/modules/base/widgets/widget.module';
import { AccountModule } from 'src/modules/tenanted/account/account.module';
import { AuthModule } from 'src/modules/tenanted/auth/auth.module';
import { BusinessUnitModule } from 'src/modules/tenanted/businessunit/businessunit.module';
import { DatacubeModule } from 'src/modules/tenanted/datacubes/datacube.module';
import { TaskModule } from 'src/modules/tenanted/datacubes/task/task.module';
import { RoleModule } from 'src/modules/tenanted/roles/role.module';
import { UserModule } from 'src/modules/tenanted/user/user.module';
import { ReportTemplateModule } from 'src/modules/tenanted/reports/report.module';
import { DisclosureModule } from 'src/modules/tenanted/disclosure/disclosure.module';
import { ChatbotModule } from 'src/modules/tenanted/chatbot/chatbot.module';
import { ConsolidatedResponseModule } from 'src/modules/tenanted/consolidated/consolidated_response.module';
import { CustomDashboardModule } from 'src/modules/tenanted/customdashboard/customdashboard.module';
import { CustomChartModule } from 'src/modules/tenanted/customdashboard/customcharts/customcharts.module';
import { createUserSwaggerConfig } from './user.swagger.config';
import { createAdminSwaggerConfig } from './admin.swagger.config';
import { TenantActivityModule } from 'src/modules/tenanted/activitylog/tenantactivity.module';

export const setupSwagger = (app: INestApplication) => {
  // User/tenant documentation
  const userConfig = createUserSwaggerConfig();
  const userDocument = SwaggerModule.createDocument(app, userConfig, {
    include: [
      AuthModule,
      DatacubeModule,
      TaskModule,
      BusinessUnitModule,
      UserModule,
      RoleModule,
      AccountModule,
      ReportTemplateModule,
      DisclosureModule,
      ChatbotModule,
      ConsolidatedResponseModule,
      CustomDashboardModule,
      CustomChartModule,
      TenantActivityModule,
    ],
  });
  SwaggerModule.setup('swagger', app, userDocument);

  // Admin documentation
  const adminConfig = createAdminSwaggerConfig();
  const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
    include: [
      AdminAuthModule,
      ModuleModule,
      IndicatorModule,
      QuestionModule,
      QuestionOption,
      SubIndicatorModule,
      DepartmentModule,
      DashboardModule,
      StandardModule,
      StandardQuestionOptionModule,
      StandardModulesModule,
      StandardIndicatorModule,
      StandardQuestionModule,
      QuestionSequenceModule,
      StandardQuestionModule,
      SectorsModule,
      IndustriesModule,
      AdminUserModule,
      AdminAccountModule,
      WidgetModule,
      StandardTemplateModule,
      // AdminRoleModule,
    ],
  });
  SwaggerModule.setup('swagger/admin', app, adminDocument);
};
