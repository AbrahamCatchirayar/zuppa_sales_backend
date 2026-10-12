/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResendInviteAccount } from 'src/modules/tenanted/auth/dto/singup.dto';
import { RoleAccessDto } from 'src/modules/tenanted/roles/role.dto';
import * as CONFIG from '../../../config.json';
import { JwtAdminAuthGuard } from '../../../jwt/jwt-gaurd';
import { QUERY_PARAMS } from '../../../utils';
import { UserDecorator } from '../../user.decorator';
import { AdminUser } from '../users/user.entity';
import { FilterQuery, InviteAccountDto, ReasonDto } from './account.dto';
import { AccountService } from './account.service';

@Controller('admin/')
@ApiTags('ACCOUNTS')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('master/roleAccess')
  async getRoleAccess() {
    return await this.accountService.getRoleAccess();
  }

  @Get('/accounts/config')
  async getTenentRolesConfig() {
    return {
      success: true,
      role: CONFIG.TENENT_ROLES,
      module: CONFIG.MODULES,
      feature: CONFIG.TENENT_FEATURES,
    };
  }

  @Post('/accounts/invite')
  async inviteTenentAccount(@Body() body: InviteAccountDto) {
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      account: await this.accountService.inviteAccount(body),
    };
  }

  @Get('/accounts')
  async getAllTenentAccounts(@Query() params: FilterQuery) {
    try {
      const { page, limit, sort } = params;
      return await this.accountService.findAll(
        QUERY_PARAMS({ page, limit, sort, ...params }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/accounts/:tenentId')
  async getTenantAccount(@Param('tenentId') accountId: string) {
    try {
      return await this.accountService.getTenantAccount(accountId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post('/accounts/:tenentId/block')
  async blockAccount(
    @Body() param: ReasonDto,
    @Param('tenentId') id: string,
    @UserDecorator() user: AdminUser,
  ) {
    return await this.accountService.blockAccount(param, id, user, false);
  }

  @Post('/:tenentId/unblock')
  async unblockAccount(@Param('tenentId') id: string) {
    return await this.accountService.unBlockAccount(id, false);
  }

  @Post('/:tenentId/suspend')
  async suspend(
    @Body() param: ReasonDto,
    @Param('tenentId') id: string,
    @UserDecorator() user: AdminUser,
  ) {
    return await this.accountService.blockAccount(param, id, user, true);
  }

  @Post('/accounts/:tenentId/unsuspend')
  async unsuspend(@Param('tenentId') id: string) {
    return await this.accountService.unBlockAccount(id, true);
  }

  @Post('/accounts/resendInvitation')
  async resendInvite(@Body() body: ResendInviteAccount) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.accountService.resendInvite(body);
  }

  @Put('/accounts/:tenentId/delete')
  async deleteTenentAccount(
    @Param('tenentId') id: string,
    @Body() body: ReasonDto,
    @UserDecorator() user: AdminUser,
  ) {
    return await this.accountService.deleteTenentAccount(id, body, user);
  }

  @Put('/accounts/:tenentId/reactivate')
  async reactivateTenentAccount(@Param('tenentId') id: string) {
    return await this.accountService.reactivateTenentAccount(id);
  }

  @Put('/accounts/:tenentId/role_access')
  async changeTenentRole(
    @Param('tenentId') id: string,
    @Body() body: RoleAccessDto,
  ) {
    return await this.accountService.changeTenentRole(id, body);
  }

  @Get('/accounts/:tenentId')
  async getTenentRolesByTenentId(@Param('tenentId') id: string) {
    return await this.accountService.getTenentRolesByTenentId(id);
  }

  @Get('/accounts/:tenentId/roleAccess')
  async getTenentRoleAccessByTenentId(@Param('tenentId') id: string) {
    return {
      success: true,
      role_access: await this.accountService.getTenentRoleAccessByTenentId(id),
    };
  }

  @Put('master/roleAccess')
  async updateRoleAccess(@Body() body: RoleAccessDto) {
    return await this.accountService.updateRoleAccess(body);
  }

  @Put('/account/:tenent_id/tenent_reset')
  async resetRoleAndAccess(@Param('tenent_id') id: string) {
    return await this.accountService.resetRoleAndAccess(id);
  }
}
