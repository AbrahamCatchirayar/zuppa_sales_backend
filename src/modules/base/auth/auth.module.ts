import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  JwtAdminRefreshStrategy,
  JwtAdminStrategy,
} from 'src/jwt/jwt-strategy';
import { env } from '../../../config';
import { AdminAuthController } from './auth.controller';
import { AdminAuthService } from './auth.service';
import { AdminUserModule } from '../users/user.module';
import { AdminAccountModule } from '../accounts/account.module';

@Module({
  imports: [
    JwtModule.register({
      secret: env.jwt_secret_admin,
      signOptions: { expiresIn: env.jwt_token_expires },
    }),
    forwardRef(() => AdminUserModule),
    AdminAccountModule,
  ],
  providers: [AdminAuthService, JwtAdminStrategy, JwtAdminRefreshStrategy],
  controllers: [AdminAuthController],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
