/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../../../utils';
import { AdminSignIn, AdminUserDto, ResetPasswordDTO } from './auth.dto';
import { UserService } from '../users/user.service';
import { AccountService } from '../accounts/account.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminUserService: UserService,
    private jwtService: JwtService,
    private readonly adminAccountService: AccountService,
  ) {}

  async adminSignIn(body: AdminSignIn) {
    try {
      const user = await this.adminUserService.findOne({ email: body.email }, [
        'id',
        'email',
        'password',
        'status',
        'confirmed_at',
      ]);
      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      if (!user.password) {
        throw new BadRequestException('Accept invitation before signin');
      }

      const areEqual = await comparePassword(user.password, body.password);
      if (!areEqual) {
        throw new BadRequestException('Invalid email or password');
      }

      if (user.status === 'BLOCKED') {
        throw new BadRequestException('User blocked');
      }

      if (!user.confirmed_at) {
        throw new BadRequestException('Please confrim before signin');
      }

      const access_token = this.jwtService.sign({ id: user.id });

      // await this.adminUserService.updateUser(
      //   { id: user.id },
      //   { last_login_at: new Date() },
      // );

      return {
        success: true,
        access_token,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(id: string) {
    return await this.adminUserService.findOne({ id });
  }

  async accountVerifyToken(token: string) {
    return await this.adminAccountService.accountVerifyToken(token);
  }

  async verifyUserToken(token: string) {
    return await this.adminUserService.verifyUserToken(token);
  }

  async findOneAccount(param: any) {
    return await this.adminAccountService.findOne(param);
  }

  async forgetPassword(email: string) {
    return await this.adminUserService.forgetPassword(email);
  }

  async resetPassword(params: ResetPasswordDTO) {
    return await this.adminUserService.resetPassword(params);
  }

  async acceptInvitation(token: string, params: AdminUserDto) {
    return await this.adminUserService.acceptInvitation(token, params);
  }
}
