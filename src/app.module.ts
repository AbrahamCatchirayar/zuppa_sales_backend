/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageModule } from './file-storage/file-storage.module';
import { MailModule } from './mail/mail.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { AccountModule } from './modules/tenanted/account/account.module';
import { AuthModule } from './modules/tenanted/auth/auth.module';
import { RoleModule } from './modules/tenanted/roles/role.module';
import { SalesModule } from './modules/tenanted/sales/sales.module';
import { UserModule } from './modules/tenanted/user/user.module';
import { AdminAccountModule } from './modules/base/accounts/account.module';
import { AdminAuthModule } from './modules/base/auth/auth.module';
import { AdminRoleModule } from './modules/base/roles/role.module';
import { AdminUserModule } from './modules/base/users/user.module';
import * as ormConfig from './orm_config/orm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    AccountModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    RoleModule,
    SalesModule,
    TenancyModule,
    MailModule,
    forwardRef(() => AdminAuthModule),
    AdminUserModule,
    AdminRoleModule,
    AdminAccountModule,
    FileStorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
