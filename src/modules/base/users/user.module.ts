/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { MailModule } from '../../../mail/mail.module';
import { AdminRoleModule } from '../roles/role.module';
import { UserController } from './user.controller';
import { AdminUser } from './user.entity';
import { UserService } from './user.service';
import { MasterRole } from '../roles/master_tenent_roles/tenent_role.entity';
import { MasterRoleAccess } from '../roles/master_tenent_roles/tenent_role_access.entity';

@Module({
  imports: [
    forwardRef(() => AdminRoleModule),
    TypeOrmModule.forFeature([AdminUser]),
    TypeOrmModule.forFeature([MasterRole]),
    TypeOrmModule.forFeature([MasterRoleAccess]),
    MailModule,
    FileStorageModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class AdminUserModule {}
