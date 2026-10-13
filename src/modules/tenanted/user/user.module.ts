/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { MailModule } from 'src/mail/mail.module';
import { AccountModule } from '../account/account.module';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// import { ReportUser } from '../task_site/task-site.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AccountModule,
    forwardRef(() => MailModule),
    forwardRef(() => AuthModule),
    FileStorageModule,
    // forwardRef(() => TaskModule),
    // forwardRef(() => ReportsModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
