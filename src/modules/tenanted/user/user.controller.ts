/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../jwt/jwt-gaurd';
import { QUERY_PARAMS, multerOptionsImage } from '../../../utils';
import { IUser, UserDecorator } from '../../user.decorator';
import {
  BlockReasonDto,
  ChangePasswordDto,
  UpdateUserByIdDto,
  UpdateUserDto,
  Userfilter,
} from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('/v1/user')
@ApiTags('TENENT_AUTH USER')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('USER')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  async getUsers(@Query() params: Userfilter) {
    const { page, limit, sort } = params;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        success: true,
        ...(await this.userService.findAllUsers(
          QUERY_PARAMS({ page, limit, sort, ...params }),
        )),
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/allusers')
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Post('change_password')
  async changePassword(
    @UserDecorator() user: User,
    @Body() params: ChangePasswordDto,
  ) {
    if (params.password !== params.passwordConfirmation) {
      throw new BadRequestException(
        'Password must be same as password confirmation',
      );
    }
    return this.userService.changePassword(user.id, params);
  }

  @Put('')
  async update(@Body() params: UpdateUserDto, @UserDecorator() user: User) {
    return this.userService.updateUser(user.id, params);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @UserDecorator() user: User) {
    return this.userService.findUserById(user.id);
  }

  @Put(':id/update')
  async updateUserById(
    @Param('id') id: string,
    @Body() params: UpdateUserByIdDto,
    @UserDecorator() user: User,
  ) {
    const users = await this.userService.findUserById(user.id);
    if (users.role !== 'ADMIN') {
      throw new BadRequestException('Only ADMIN can update users');
    }
    return this.userService.updateById(id, params);
  }

  @Post(':id/block')
  async blockUser(
    @Param('id') id: string,
    @UserDecorator() user: User,
    @Body() param: BlockReasonDto,
  ) {
    if (id === user.id) {
      throw new BadRequestException("User can't block by themself");
    }

    return this.userService.blockUser(id, param);
  }

  @Post(':id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.userService.unBlockUser(id);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string, @UserDecorator() user: User) {
    return this.userService.deleteUser(id, user);
  }

  @Post('upload_avatar')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a avatar file for user' })
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
  async uploadAvatar(@UploadedFile() file: any, @UserDecorator() user: IUser) {
    try {
      if (!file) {
        throw new BadRequestException('Please select a file to upload');
      }

      return await this.userService.userUploadAvatar(file, user);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete('delete_avatar')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(@UserDecorator() user: IUser) {
    return await this.userService.userDeleteAvatar(user);
  }

  @Put('updateRole/:user_id/:admin_id')
  async changeRole(
    @Param('user_id') id: string,
    @Param('admin_id') _id: string,
  ) {
    return await this.userService.changeUserRole(id, _id);
  }
}
