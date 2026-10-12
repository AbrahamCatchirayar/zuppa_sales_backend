import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserModule } from '../users/user.module';
import { MasterRole } from './master_tenent_roles/tenent_role.entity';
import { MasterRoleAccess } from './master_tenent_roles/tenent_role_access.entity';
import { AdminRoleController } from './role.controller';
import { AdminRole } from './role.entity';
import { AdminRoleService } from './role.service';
import { AdminRoleAccess } from './role_access.entity';
import { RoleAccessService } from 'src/modules/tenanted/roles/role-access.service';
import { MasterAccount } from '../accounts/account.entity';

@Module({
  imports: [
    forwardRef(() => AdminUserModule),
    TypeOrmModule.forFeature([
      AdminRole,
      AdminRoleAccess,
      MasterRole,
      MasterRoleAccess,
      MasterAccount,
    ]),
  ],
  controllers: [AdminRoleController],
  providers: [AdminRoleService, RoleAccessService],
  exports: [AdminRoleService],
})
export class AdminRoleModule {}
