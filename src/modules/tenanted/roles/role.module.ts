import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RoleAccess } from './role-access.entity';
import { RoleAccessService } from './role-access.service';
import { RoleController } from './role.controller';
import { Role } from './role.entity';
import { RoleService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RoleAccess]),
    forwardRef(() => AuthModule),
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleAccessService],
  exports: [RoleService],
})
export class RoleModule {}
