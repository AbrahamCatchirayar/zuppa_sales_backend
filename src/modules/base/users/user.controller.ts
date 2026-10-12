/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { FileInterceptor } from '@nestjs/platform-express';
import { QUERY_PARAMS, multerOptionsImage } from '../../../utils';
import { IUser, UserDecorator } from '../../user.decorator';
import { UserService } from './user.service';
import {
  AdminFilter,
  InvitationAdminDto,
  AdminResendInvitationDto,
  ChangeAdminPasswordDto,
  Reason,
  UpdateAdminUserDto,
  UpdateAdminMemberDto,
} from '../auth/auth.dto';

@ApiTags('ADMIN_AUTH')
@Controller('admin')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getUser(@Query() params: AdminFilter) {
    const { page, limit, sort } = params;
    return await this.userService.findAllUser(
      QUERY_PARAMS({ page, limit, sort, ...params }),
    );
  }

  @Post('invite')
  @ApiOperation({
    summary: 'Creates a new admin with a specific role by the admin',
    description:
      'Required fields => 1. first_name, 2. last_name, 3. email, 4. role',
  })
  async inviteUser(@Body() params: InvitationAdminDto, @UserDecorator() user) {
    return await this.userService.inviteUser(params, user.id);
  }

  @Post(':id/resend_invitation')
  @ApiBearerAuth('ADMIN')
  async resendInvite(
    @Param('id') id: string,
    @Body() params: AdminResendInvitationDto,
  ) {
    return this.userService.resendInvite(id, params);
  }

  @Post('change_password')
  @ApiOperation({
    summary: 'To change own password',
  })
  async changePassword(
    @Body() params: ChangeAdminPasswordDto,
    @UserDecorator() user,
  ) {
    return await this.userService.changePassword(user.id, params);
  }

  @Post('upload_avatar')
  @ApiOperation({ summary: 'Upload a avatar file for admin' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptionsImage))
  async uploadAvatar(@UserDecorator() user: IUser, @UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('Please select a file to upload');
      }

      return await this.userService.uploadAvatar(user, file);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Post(':id/block')
  async blockUser(
    @UserDecorator() user,
    @Param('id') id: string,
    @Body() params: Reason,
  ) {
    if (id === user.id) {
      throw new BadRequestException("Admin can't block by him self");
    }
    return await this.userService.blockUser(id, params);
  }

  @Post(':id/unblock')
  async unBlockUser(@Param('id') id: string) {
    return await this.userService.unBlockUser(id);
  }

  @Put('')
  async update(@Body() params: UpdateAdminUserDto, @UserDecorator() user) {
    return await this.userService.update(user.id, params);
  }

  @Put(':id')
  async updateUserByUserId(
    @Param('id') id: string,
    @Body() params: UpdateAdminMemberDto,
  ) {
    return await this.userService.updateUserByUserId(id, params);
  }

  @Delete('delete_avatar')
  async deleteAvatar(@UserDecorator() user: IUser) {
    return await this.userService.deleteAvatar(user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @UserDecorator() user) {
    if (id === user.id) {
      throw new BadRequestException("Admin can't delete himself");
    }

    return await this.userService.delete(id);
  }
}
