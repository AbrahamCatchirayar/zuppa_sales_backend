import { Global, MiddlewareConsumer, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { AdminAccountModule } from '../base/accounts/account.module';
import {
  tenancyMiddleware,
  tenancyMiddlewareAdmin,
} from './tenancy.middleware';
import { CONNECTION } from './tenancy.symbol';
import { getTenantConnection } from './tenancy.utils';

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
  imports: [AdminAccountModule],
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
