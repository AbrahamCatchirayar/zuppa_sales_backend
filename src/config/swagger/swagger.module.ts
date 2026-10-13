import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AdminAccountModule } from 'src/modules/base/accounts/account.module';
import { AdminAuthModule } from 'src/modules/base/auth/auth.module';
import { AdminRoleModule } from 'src/modules/base/roles/role.module';
import { AdminUserModule } from 'src/modules/base/users/user.module';
import { AccountModule } from 'src/modules/tenanted/account/account.module';
import { AuthModule } from 'src/modules/tenanted/auth/auth.module';
import { RoleModule } from 'src/modules/tenanted/roles/role.module';
import { UserModule } from 'src/modules/tenanted/user/user.module';
import { createUserSwaggerConfig } from './user.swagger.config';
import { createAdminSwaggerConfig } from './admin.swagger.config';

export const setupSwagger = (app: INestApplication) => {
  // User/tenant documentation
  const userConfig = createUserSwaggerConfig();
  const userDocument = SwaggerModule.createDocument(app, userConfig, {
    include: [
      AuthModule,
      UserModule,
      RoleModule,
      AccountModule,
    ],
  });
  SwaggerModule.setup('swagger', app, userDocument);

  // Admin documentation
  const adminConfig = createAdminSwaggerConfig();
  const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
    include: [
      AdminAuthModule,
      AdminUserModule,
      AdminRoleModule,
      AdminAccountModule,
    ],
  });
  SwaggerModule.setup('swagger/admin', app, adminDocument);
};
