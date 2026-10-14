/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-await */

import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { UserDecorator } from 'src/modules/user.decorator';
import * as CONFIG from '../../../config.json';
import { User } from '../user/entities/user.entity';
import { RoleAccessService } from './role-access.service';
import { CreateRoleDTO, RoleAccessDto } from './role.dto';
import { RoleService } from './role.service';

@Controller('v1/role')
@ApiTags('TENENT_ROLES')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly roleAccessService: RoleAccessService,
  ) {}

  @Get('currentAccess')
  async currentAccess(@UserDecorator() user: User) {
    return await this.roleService.currentAccess(user);
  }

  @Get('config')
  async getRolesConfig() {
    const roles = await this.roleService.findall();
    return {
      success: true,
      role: roles && roles.length > 0 ? roles : CONFIG.TENENT_ROLES,
      module: CONFIG.MODULES,
      feature: CONFIG.TENENT_FEATURES,
    };
  }

  @Get('')
  async getRoles() {
    return {
      success: true,
      roles: await this.roleService.findall(),
    };
  }

  @Post('')
  async createRole(@Body() body: CreateRoleDTO) {
    return {
      success: true,
      role: await this.roleService.create({ name: body.role }),
    };
  }

  @Get('access')
  async getAccess() {
    return {
      success: true,
      role_access: await this.roleService.getByRoleAccess(),
    };
  }

  @Put('updateRoleAccess')
  async updateAccess(@Body() body: RoleAccessDto) {
    return {
      success: true,
      role_access: await this.roleService.createRoleAccess(body),
    };
  }

  @Put('resetRoleAccess')
  async updateRole() {
    return await this.roleService.resetRoleAccess();
  }
}
