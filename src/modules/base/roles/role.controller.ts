/* eslint-disable no-return-await */

import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { CreateAdminRoleAccessDto, CreateAdminRoleDto } from './role.dto';
import { AdminRoleService } from './role.service';

@ApiTags('ADMIN_ROLES')
@Controller('admin/roles')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class AdminRoleController {
  constructor(private readonly adminRoleService: AdminRoleService) {}

  @Post()
  async createRole(@Body() body: CreateAdminRoleDto) {
    return {
      success: true,
      role: await this.adminRoleService.createRole(body),
    };
  }

  @Put('access')
  async createRoleAccess(@Body() body: CreateAdminRoleAccessDto) {
    return await this.adminRoleService.createRoleAccess(body);
  }
}
