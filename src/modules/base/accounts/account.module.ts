import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../../mail/mail.module';
import { MasterAccount } from './account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MasterRole } from '../roles/master_tenent_roles/tenent_role.entity';
import { MasterRoleAccess } from '../roles/master_tenent_roles/tenent_role_access.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterAccount, MasterRole, MasterRoleAccess]),
    MailModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AdminAccountModule {}
