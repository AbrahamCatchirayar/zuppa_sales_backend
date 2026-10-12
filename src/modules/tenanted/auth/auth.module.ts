/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  JwtAccessRefreshTokenStrategy,
  JwtAccessTokenStrategy,
} from 'src/jwt/jwt-strategy';
import { MailModule } from 'src/mail/mail.module';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module';
import { AuthController, UnAuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnAuthService } from './unauth.service';

@Module({
  // eslint-disable-next-line no-use-before-define
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({}),
    MailModule,
    AccountModule,
    FileStorageModule,
  ],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  controllers: [AuthController, UnAuthController],
  providers: [
    AuthService,
    UnAuthService,
    JwtAccessTokenStrategy,
    JwtAccessRefreshTokenStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
