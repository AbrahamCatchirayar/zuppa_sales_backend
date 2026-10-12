/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/require-await */

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { UserDecorator } from '../../user.decorator';
import {
  AdminSignIn,
  AdminUserDto,
  EmailDTO,
  ResetPasswordDTO,
} from './auth.dto';
import { AdminAuthService } from './auth.service';
import { AdminUser } from '../users/user.entity';

@Controller('admin')
@ApiTags('Admin Authentication')
export class AdminAuthController {
  constructor(private readonly adminservice: AdminAuthService) {}

  @Post('signin')
  async adminSignIn(@Body() body: AdminSignIn) {
    return await this.adminservice.adminSignIn(body);
  }

  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth('ADMIN')
  @Get('me')
  async getUser(@UserDecorator() user: AdminUser) {
    return { success: true, user };
  }

  @Get(':token/accountverify')
  async accountVerifyToken(@Param('token') token: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.adminservice.accountVerifyToken(token);
  }

  @Get(':token/verify_invitation')
  async VerifyUserToken(@Param('token') token: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.adminservice.verifyUserToken(token);
  }

  @Post('forget_password')
  @ApiOperation({
    summary: 'Generate a token and sent via given email ID',
    description: 'Required fields: 1. email',
  })
  async forgetPassword(@Body() params: EmailDTO) {
    return await this.adminservice.forgetPassword(params.email);
  }

  @Post('reset_password')
  async resetPassword(@Body() params: ResetPasswordDTO) {
    return await this.adminservice.resetPassword(params);
  }

  @Post(':token/accept_invitation')
  async acceptInvitation(
    @Param('token') token: string,
    @Body() params: AdminUserDto,
  ) {
    return await this.adminservice.acceptInvitation(token, params);
  }
}
