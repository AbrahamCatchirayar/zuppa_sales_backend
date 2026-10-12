/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { FileService } from '../../../file-storage/file-storage.service';
import { IUser } from '../../user.decorator';
import { env } from '../../../config';
import { comparePassword } from '../../../utils';
import { AccountService } from '../account/account.service';
import { UserService } from '../user/user.service';
import { CompanyDetailsDto } from './dto/company-details.dto';
import {
  InvitationDTO,
  OnboardDto,
  OnboardUpdate,
  ResendInvitationDto,
} from './dto/invite-user.dto';
import { AcceptInvitationDTO, SignInDTO } from './dto/singup.dto';

@Injectable()
export class AuthService {
  constructor(
    public jwtService: JwtService,
    private readonly userservice: UserService,
    private readonly accountService: AccountService,
    private readonly fileService: FileService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async findOne(param: any) {
    return this.userservice.findOne(param);
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          is_guest: false,
        },
        {
          secret: env.jwt_secret,
          expiresIn: env.jwt_token_expires,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: env.jwt_refresh_secret,
          expiresIn: env.jwt_refresh_expires,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signIn(body: SignInDTO) {
    try {
      const user = await this.userservice.findOne({ email: body.email }, [
        'id',
        'email',
        'password',
        'status',
      ]);

      if (!user) throw new BadRequestException('Invalid email/password');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const areEqual = await comparePassword(user?.password, body?.password);
      if (!areEqual) throw new BadRequestException('Invalid email/password');

      const tokens = await this.getTokens(user.id, user.id);
      await this.userservice.update(user.id, {
        refresh_token: await this.hashData(tokens.refreshToken),
      });

      return tokens;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      const user = await this.userservice.findOne({ id: userId }, [
        'id',
        'refresh_token',
      ]);

      if (!user || !user.refresh_token) throw new UnauthorizedException();

      const refreshTokenMatches = await argon2.verify(
        user.refresh_token,
        refreshToken,
      );

      if (!refreshTokenMatches) throw new UnauthorizedException();
      const tokens = await this.getTokens(user.id, user.id);
      await this.userservice.update(user.id, {
        refresh_token: await this.hashData(tokens.refreshToken),
      });

      return {
        ...tokens,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async forgotPassword(email: any) {
    return this.userservice.forgotPassword(email);
  }

  async resetPassword(params: any) {
    return this.userservice.resetPassword(params);
  }

  async updateCompanyDetails(params: CompanyDetailsDto, user: IUser) {
    await this.userservice.updateCompanyDetails(user.account.id, params);
    return {
      success: true,
      message: 'Account updated successfully',
    };
  }

  async acceptInvitation(token: string, body: AcceptInvitationDTO) {
    return await this.userservice.acceptInvitation(token, body);
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.userservice.logout(userId);
  }

  async invitation(body: InvitationDTO, param: OnboardDto, user) {
    // eslint-disable-next-line no-return-await
    return await this.userservice.InviteMultiUser(body, param, user);
  }

  async resendInvite(id: string, param: ResendInvitationDto, user) {
    // eslint-disable-next-line no-return-await
    return await this.userservice.resendInvite(id, param, user);
  }

  async verifyToken(token: string) {
    return this.userservice.verifyToken(token);
  }

  async uploadAvatar(user: IUser, file: any) {
    return await this.userservice.uploadAvatar(user, file);
  }

  async deleteAvatar(user: IUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only admin can delete avatar');
    }

    return await this.userservice.deleteAvatar();
  }

  async updateOnboard(param: OnboardUpdate) {
    return await this.userservice.updateOnboard(param);
  }
}
