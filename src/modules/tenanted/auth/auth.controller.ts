/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-return-await */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */

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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { multerOptionsImage } from 'src/utils';
import { JwtAuthGuard, JwtAuthRefreshGuard } from '../../../jwt/jwt-gaurd';
import { IUser, UserDecorator } from '../../user.decorator';
import { AccountService } from '../account/account.service';
import { resetPasswordDto } from '../user/dto/reset-password.dto';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { CompanyDetailsDto } from './dto/company-details.dto';
import {
  InvitationDTO,
  OnboardDto,
  OnboardUpdate,
  ResendInvitationDto,
} from './dto/invite-user.dto';
import {
  AcceptAccountInvitationDTO,
  AcceptInvitationDTO,
  EmailDTO,
  ResendInviteAccount,
  SignInDTO,
  SignUpDTO,
} from './dto/singup.dto';
import { UnAuthService } from './unauth.service';

@Controller('auth')
@ApiTags('TENENT_UNAUTH')
export class UnAuthController {
  constructor(private readonly unauthService: UnAuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignUpDTO) {
    if (body?.slug.length < 4) {
      throw new BadRequestException(
        'Workspace length should be greater than 3 letters',
      );
    }
    const isSlugVerify = await this.unauthService.slugchecker(
      body?.slug.toLowerCase(),
    );
    if (!isSlugVerify?.success) {
      throw new BadRequestException('Workspace is already exists!');
    }
    return this.unauthService.signUp(body);
  }

  @Post('resendInvitation')
  async resendInvite(@Body() body: ResendInviteAccount) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.unauthService.resendInvite(body);
  }

  @Post(':token/confirm')
  async confirm(@Param('token') token: string) {
    await this.unauthService.accountConfirmation(token);
    return {
      success: true,
    };
  }

  @Post(':token/acceptInvitation')
  async acceptInvitation(
    @Param('token') invitation_Token: string,
    @Body() body: AcceptAccountInvitationDTO,
  ) {
    if (body.password !== body.confirm_password) {
      throw new BadRequestException('Password not match');
    }
    await this.unauthService.accountConfirmation(invitation_Token, body);

    return {
      success: true,
    };
  }

  @Post('slug/:slug')
  async slugCheck(@Param('slug') slug: string) {
    if (slug.length < 4) {
      throw new BadRequestException(
        'Slug length should be greater than 3 letters',
      );
    }
    return this.unauthService.slugchecker(slug.toLowerCase());
  }
}

@Controller('v1/auth')
@ApiTags('TENENT_AUTH')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post('signin')
  async signIn(@Body() body: SignInDTO) {
    return { success: true, ...(await this.authService.signIn(body)) };
  }

  @Post('forgot_password')
  async forgotPassword(@Body() body: EmailDTO) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset_password')
  @ApiOperation({
    summary: 'To reset the password',
    description:
      'Required fields => 1. organization code, 2. token, 3. password, 4. password_confirmation',
  })
  async resetPassword(@Body() params: resetPasswordDto) {
    if (params.password !== params.passwordConfirmation) {
      throw new BadRequestException('Password do not match');
    }
    return this.authService.resetPassword(params);
  }

  @Post(':token/accept_invitation')
  async acceptInvitation(
    @Param('token') token: string,
    @Body() body: AcceptInvitationDTO,
  ) {
    return this.authService.acceptInvitation(token, body);
  }

  @Get(':token/verify')
  async verifyToken(@Param('token') token: string) {
    return this.authService.verifyToken(token);
  }

  @Put('company_details')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  async updateCompanyDetails(
    @UserDecorator() user: IUser,
    @Body() params: CompanyDetailsDto,
  ) {
    return {
      ...(await this.authService.updateCompanyDetails(params, user)),
      onboarding: (await this.accountService.findOne())[0]
        .current_onboarding_stage,
    };
  }

  @Post('logout')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  async logout(@UserDecorator() user: User) {
    return this.authService.logout(user.id);
  }

  @Get('me')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  async me(@UserDecorator() user) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: {
        ...user,
        account: await this.accountService.findAccount(user),
      },
    };
  }

  @Get('refresh')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthRefreshGuard)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async refreshToken(@UserDecorator() user: any) {
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...(await this.authService.refreshTokens(user.sub, user.refreshToken)),
    };
  }

  @Post('invitation')
  @ApiBearerAuth('USER')
  @ApiOperation({ description: 'name: isOptional, role: isOptional' })
  @UseGuards(JwtAuthGuard)
  async inviteUsers(
    @Body() body: InvitationDTO,
    @Query() param: OnboardDto,
    // @Req() data: any,
    @UserDecorator() user: IUser,
  ) {
    switch (user.role) {
      case 'GUEST':
        if (['GUEST', 'ADMIN'].includes(body.invitation[0].role)) {
          throw new BadRequestException("Can't invite call rubicr admin");
        }
        break;

      // case 'OWNER':
      //   if (body.invitation[0].role === 'ADMIN') {
      //     throw new BadRequestException('Admin can only invite by admin');
      //   }
      //   break;

      default:
        break;
    }
    return {
      success: true,
      message: 'Invite sended successfully',
      data: await this.authService.invitation(body, param, user),
      onboarding: (await this.accountService.findOne())[0]
        .current_onboarding_stage,
    };
  }

  @Post(':id/resend_invitation')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  async resendInvite(
    @Param('id') id: string,
    @Body() params: ResendInvitationDto,
    @UserDecorator() user: IUser,
  ) {
    return this.authService.resendInvite(id, params, user);
  }

  @Put('update/onboarding')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  async updateOnboarding(@Query() params: OnboardUpdate) {
    return await this.authService.updateOnboard(params);
  }

  @Post('upload_avatar')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a avatar file for account' })
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
      return this.authService.uploadAvatar(user, file);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete('delete_avatar')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  async deleteAvatar(@UserDecorator() user: IUser) {
    return await this.authService.deleteAvatar(user);
  }
}
