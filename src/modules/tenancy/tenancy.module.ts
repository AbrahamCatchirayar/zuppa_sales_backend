import { Global, MiddlewareConsumer, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { AccountModule } from 'src/modules/tenanted/account/account.module';
import { AuthModule } from '../tenanted/auth/auth.module';
import { BusinessUnitModule } from '../tenanted/businessunit/businessunit.module';
import { SiteModule } from '../tenanted/sites/sites.module';
// import { TaskModule } from '../tenanted/tasks/tasks.module';
import { AdminAccountModule } from '../base/accounts/account.module';
import { AdminRoleModule } from '../base/roles/role.module';
import { AdminUserModule } from '../base/users/user.module';
import { TenentSectorModule } from '../tenanted/tenentsectors/sector.module';
import { UserModule } from '../tenanted/user/user.module';
import {
  tenancyMiddleware,
  tenancyMiddlewareAdmin,
} from './tenancy.middleware';
import { CONNECTION } from './tenancy.symbol';
import { getTenantConnection } from './tenancy.utils';
import { DatacubeModule } from '../tenanted/datacubes/datacube.module';
import { TaskModule } from '../tenanted/datacubes/task/task.module';
import { ReportTemplateModule } from '../tenanted/reports/report.module';
import { DisclosureModule } from '../tenanted/disclosure/disclosure.module';
import { ChatbotModule } from '../tenanted/chatbot/chatbot.module';
import { ConsolidatedResponseModule } from '../tenanted/consolidated/consolidated_response.module';
import { CustomDashboardModule } from '../tenanted/customdashboard/customdashboard.module';
import { CustomChartModule } from '../tenanted/customdashboard/customcharts/customcharts.module';

const connectionFactory = {
  provide: CONNECTION,
  scope: Scope.REQUEST,
  useFactory: async (request: ExpressRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tenantId }: any = request;
    if (tenantId) {
      return getTenantConnection(tenantId);
    }
    return null;
  },
  inject: [REQUEST],
};

@Global()
@Module({
  imports: [
    UserModule,
    AuthModule,
    AccountModule,
    AdminAccountModule,
    AdminUserModule,
    AdminRoleModule,
    AccountModule,
    BusinessUnitModule,
    SiteModule,
    TenentSectorModule,
    DatacubeModule,
    TaskModule,
    ReportTemplateModule,
    DisclosureModule,
    ChatbotModule,
    ConsolidatedResponseModule,
    CustomDashboardModule,
    CustomChartModule,
  ],
  providers: [connectionFactory],
  exports: [CONNECTION],
})
export class TenancyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(tenancyMiddleware).forRoutes('/v1');
    consumer.apply(tenancyMiddlewareAdmin).forRoutes('/admin');
    consumer.apply(tenancyMiddleware).forRoutes('/admin/tenent');
  }
}
