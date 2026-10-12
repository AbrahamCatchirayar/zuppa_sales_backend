/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-shadow */

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DataSource, ILike, Not, Repository } from 'typeorm';
import { AccountStatus } from '../../../enum/account.status';
import { UserStatus } from './enums/tenentuser.enum';
import { FileService } from '../../../file-storage/file-storage.service';
import { MailServiceRq } from '../../../mail/mail.service';
import { comparePassword, tokenGenerator } from '../../../utils';
import { CONNECTION } from '../../tenancy/tenancy.symbol';
import { Account } from '../account/account.entity';
import { AccountService } from '../account/account.service';
import {
  Invitation,
  InvitationDTO,
  OnboardDto,
  OnboardUpdate,
  ResendInvitationDto,
} from '../auth/dto/invite-user.dto';
import { AcceptInvitationDTO } from '../auth/dto/singup.dto';
import { resetPasswordDto } from './dto/reset-password.dto';
import {
  BlockReasonDto,
  ChangePasswordDto,
  UpdateUserByIdDto,
} from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CompanyDetailsDto } from '../auth/dto/company-details.dto';

@Injectable()
export class UserService {
  private readonly userModel: Repository<User>;

  private readonly connection: DataSource;

  // private readonly accountService: AccountService;

  constructor(
    @Inject(CONNECTION) connection: DataSource,
    private readonly accountService: AccountService,
    private readonly mailService: MailServiceRq,
    private readonly fileService: FileService,
  ) {
    this.connection = connection;
    this.userModel = connection.getRepository(User);
  }

  async findOne(param: any, select = null) {
    const query: any = {
      where: param,
    };

    if (select) {
      query.select = select;
    }

    const userinfo: any = await this.userModel.findOne(query);

    if (!userinfo) {
      throw new BadRequestException('Invalid credentials');
    }
    const account = (
      await this.connection.manager.getRepository(Account).find()
    )[0];
    return {
      ...userinfo,
      account,
    };
  }

  async forgotPassword(email: string) {
    const token = tokenGenerator();
    try {
      const user = await this.userModel.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      user.forgot_password_token = token;
      user.forgot_password_sent_at = new Date();
      await this.userModel.save(user);
      const account = await this.accountService.findOne();
      this.mailService.send('tenant-forgot_password', {
        slug: account[0].slug,
        token: user.forgot_password_token,
        name: user.name,
        email: user.email,
        isAccount: true,
      });
      return {
        success: true,
        message: 'Password reset link sent successfully',
        forgot_password_token: token,
      };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(err.message || err);
    }
  }

  async resetPassword(params: resetPasswordDto) {
    try {
      const { token, password } = params;

      const account = await this.accountService.findOne();
      const user = await this.userModel.findOne({
        where: { forgot_password_token: token },
      });

      if (!user) {
        throw new BadRequestException('Tonken invalid');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      user.password = await bcrypt.hash(password, 10);
      user.forgot_password_token = null;
      user.password_reset_on = new Date();
      await this.userModel.save(user);

      this.mailService.send('tenant-reset_password', {
        slug: account[0].slug,
        token: user.forgot_password_token,
        name: user.name,
        email: user.email,
        isAccount: true,
      });

      return {
        success: true,
        message: 'PASSWORD RESET SUCCESSFULLY',
      };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(err.message || err);
    }
  }

  async update(userid: string, updatePayload: any) {
    return this.userModel.update({ id: userid }, updatePayload);
  }

  async getOneAccount() {
    const account = await this.connection.getRepository(Account).find();
    return account[0];
  }

  async logout(userid: string) {
    try {
      const user = await this.userModel.findOne({ where: { id: userid } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      user.refresh_token = null;
      await this.userModel.save(user);
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(err.message || err);
    }
  }

  async InviteUser(body: Invitation, param: OnboardDto, userDetails) {
    const transaction = this.connection.createQueryRunner();
    await transaction.connect();
    await transaction.startTransaction();
    try {
      const account = (await this.accountService.findOne())[0];

      const userinfo = {
        email: body.email,
        name: body.name,
        invitation_token: tokenGenerator(),
        invitation_token_sent_at: new Date(),
        role: body.role || 'USER',
        status: 'PENDING',
      };

      const user = await transaction.manager
        .getRepository(User)
        .findOne({ where: { email: body.email } });

      if (user) throw new BadRequestException('User already exists');

      await transaction.manager
        .getRepository(User)
        .save(Object.assign(new User(), userinfo));

      if (param.onboarding === 'true') {
        const account = (await this.accountService.findOne())[0];
        await transaction.manager
          .getRepository(Account)
          .update(account.id, { current_onboarding_stage: 4 });
      }

      this.mailService.send('tenent-invitation', {
        manager_name: userDetails.name,
        slug: account.slug,
        token: userinfo.invitation_token,
        email: userinfo.email,
        name: userinfo.name,
        isAccount: false,
      });

      await transaction.commitTransaction();
      return true;
    } catch (error) {
      await transaction.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await transaction.release();
    }
  }

  async emailsExistsCheck(emails: string[]) {
    const existingUsers = await this.userModel.find({
      where: emails.map((email) => ({ email })),
    });

    const existingEmails = existingUsers.map((user) => user.email);
    const emailsToReject = emails.filter((email) =>
      existingEmails.includes(email),
    );
    if (emailsToReject.length > 0) {
      const errors = {};
      emails.forEach((user) => {
        errors[user] = emailsToReject.includes(user);
      });

      throw new BadRequestException({
        message: 'Email already exists',
        error: errors,
      });
    }
  }

  async InviteMultiUser(body: InvitationDTO, onBoard: OnboardDto, user) {
    try {
      const emails = body.invitation.map((value) => value.email);

      // Check for duplicates by comparing the length of the array and the set
      const uniqueEmails = new Set(emails);
      if (emails.length !== uniqueEmails.size) {
        throw new BadRequestException('Duplicate email ID(s) found.');
      }

      await this.emailsExistsCheck(emails);

      return await Promise.all(
        body.invitation.map(async (param: Invitation) => {
          return await this.InviteUser(param, onBoard, user);
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async resendInvite(id: string, params: ResendInvitationDto, userDetail) {
    try {
      const account = (await this.accountService.findOne())[0];
      if (!account) {
        throw new BadRequestException('Invalid id');
      }

      const user = await this.userModel.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException('Invalid id');
      }

      if (!user.invitation_token && user.status !== 'PENDING') {
        throw new BadRequestException('User already confirmed');
      }

      if (params.email) {
        // eslint-disable-next-line no-underscore-dangle
        const _user = await this.userModel.findOne({
          where: { email: params.email },
        });

        if (_user && _user.id !== id) {
          throw new BadRequestException('Email already exists');
        }

        user.email = params.email;
      }

      user.invitation_token = tokenGenerator();
      user.invitation_sent_at = new Date();
      await this.userModel.save(user);

      this.mailService.send('tenent-invitation', {
        manager_name: userDetail.name,
        token: user.invitation_token,
        email: user.email,
        name: user.name,
        isAccount: false,
        slug: account.slug,
      });

      return {
        success: true,
        message: 'resend invitation sent successfully',
      };
    } catch (err) {
      throw new BadRequestException(
        (err as unknown as { message: string })?.message || err,
      );
    }
  }

  async acceptInvitation(invitationtoken: string, body: AcceptInvitationDTO) {
    try {
      const user = await this.userModel.findOne({
        where: { invitation_token: invitationtoken },
      });

      if (!user) {
        throw new BadRequestException('Token invalid');
      }

      if (body.password !== body.confirm_password) {
        throw new BadRequestException('Password Doesnot match');
      }
      user.name = body.name;
      user.phone_number = body.phone_number;
      user.password = await bcrypt.hash(body.password, 10);
      user.accept_terms_of_service = body.accept_terms_and_conditions;
      user.confirmed_at = new Date();
      user.invitation_token = null;
      user.status = AccountStatus.ACTIVE;

      await this.userModel.save(user);

      return { success: true, message: 'Account Created Successfully' };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async verifyToken(token: string) {
    try {
      const user = await this.findOne({ invitation_token: token });
      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      // if (user.invitation_token_sent_at < new Date()) {
      //   throw new BadRequestException('Token Expired');
      // }
      return { success: true, user };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async updateCompanyDetails(id: string, param: CompanyDetailsDto) {
    return await this.accountService.updateCompanyDetails(id, param);
  }

  async updateUser(userId, params) {
    try {
      await this.userModel.update({ id: userId }, params);

      return {
        success: true,
        user: await this.userModel.findOne({
          where: { id: userId },
        }),
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async findUserById(id: string) {
    return await this.userModel.findOne({
      where: { id },
    });
  }

  async updateById(id: string, params: UpdateUserByIdDto) {
    try {
      const user = await this.userModel.findOne({
        where: { id },
      });
      if (!user) {
        throw new BadRequestException('Invalid user');
      }

      return await this.updateUser(id, params);
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async blockUser(id: string, param: BlockReasonDto) {
    try {
      const _user = await this.userModel.findOne({ where: { id } });
      if (!_user) {
        throw new BadRequestException('Invalid user');
      }
      if (_user.status === UserStatus.BLOCKED) {
        throw new BadRequestException('User already blocked');
      } else if (_user.status === UserStatus.ACTIVE) {
        _user.blocked_on = new Date();
        _user.blocked_reason = param.blocked_reason;
        _user.status = UserStatus.BLOCKED;
        await this.userModel.save(_user);
        return { success: true, message: 'USER BLOCKED' };
      } else {
        throw new BadRequestException('Only active user can be blocked');
      }
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async unBlockUser(id: string) {
    try {
      const user = await this.userModel.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException('Invalid user');
      }

      if (user.status !== UserStatus.BLOCKED) {
        throw new BadRequestException('Only blocked user can be unblocked');
      }

      user.status = UserStatus.ACTIVE;
      // user.reason=param.reason
      user.blocked_on = null;
      user.blocked_reason = null;
      await this.userModel.save(user);
      return {
        success: true,
        message: 'USER UN-BLOCKED',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async deleteUser(id: string, _user: User) {
    try {
      const user = await this.userModel.findOne({ where: { id } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (id === _user.id) {
        throw new BadRequestException('User cant delete himself');
      }
      if (_user.role !== 'ADMIN') {
        throw new BadRequestException('Only admin can delete users');
      }
      user.status = 'DELETE';
      await this.userModel.save(user);
      return { success: true, message: 'USER DELETED SUCCESSFULLY' };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async findAllUsers(params) {
    const { limit, skip, sort, page, filter } = params;

    const Query = {
      take: limit,
      skip,
      order: sort,
      where: {},
    };

    Query.where = { ...Query.where, status: Not('DELETE') };

    if (filter) {
      if (filter.role) {
        Query.where = { ...Query.where, role: filter.role };
      }

      if (filter.status) {
        Query.where = { ...Query.where, status: filter.status };
      }

      if (filter.search) {
        Query.where = [
          { ...Query.where, email: ILike(`%${filter.search}%`) },
          { ...Query.where, name: ILike(`%${filter.search}%`) },
        ];
      }
    }

    const [data, totalCount] = await this.userModel.findAndCount(Query);

    return {
      users: data,
      meta: {
        currentCount: data.length,
        currentPage: parseInt(page, 10),
        currentLimit: parseInt(limit, 10),
        totalCount,
      },
    };
  }

  async getAllUsers() {
    try {
      const users = await this.userModel.find();
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findUser(param) {
    return await this.userModel.findOne({ where: param });
  }

  async changePassword(userId: string, params: ChangePasswordDto) {
    try {
      const user = await this.userModel.findOne({
        where: { id: userId },
        select: ['password'],
      });
      const { oldPassword, password } = params;

      const isOldPasswordValid = await comparePassword(
        user.password,
        oldPassword,
      );

      if (!isOldPasswordValid) {
        throw new BadRequestException('Old password doesnot match');
      }

      if (params.oldPassword === params.password) {
        throw new BadRequestException(
          'Password must not be same as old password',
        );
      }

      user.password = await bcrypt.hash(password, 10);
      await this.userModel.update({ id: userId }, user);

      return {
        success: true,
        message: 'PASSWORD CHANGED SUCCESSFULLY',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async uploadAvatar(user: any, file: any) {
    try {
      if (user.role !== 'ADMIN') {
        throw new BadRequestException('Only admin can upload');
      }
      const account = (await this.accountService.findOne())[0];

      const avatar = await this.fileService.uploadAvatar(file, account.id);

      account.logo_path = avatar.url;
      const updatedAccount = await this.accountService.updateAvatar(account);

      return {
        success: true,
        account: updatedAccount,
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async deleteAvatar() {
    const account = (await this.accountService.findOne())[0];
    await this.connection.manager
      .getRepository(Account)
      .update({ id: account.id }, { logo_path: null });

    return {
      success: true,
      message: 'Avatar Deleted Successfully',
    };
  }

  async updateOnboard(param: OnboardUpdate) {
    try {
      const account = (await this.accountService.findOne())[0];
      let onboardingValue;
      switch (param.onboarding) {
        case 'business_unit':
          onboardingValue = 2;
          break;
        case 'standard':
          onboardingValue = 3;
          break;
        case 'invite':
          onboardingValue = 4;
          break;
        case 'plan':
          onboardingValue = 5;
          break;
        default:
          throw new BadRequestException('Invalid onboarding type');
      }
      await this.accountService.updateOnboarding(account.id, onboardingValue);

      return {
        success: true,
        message: 'update onboarding steps',
        onboarding: (await this.accountService.findOne())[0]
          .current_onboarding_stage,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async userUploadAvatar(file: any, user: any) {
    try {
      const _user = await this.userModel.findOne({ where: { id: user.id } });
      const avatar = await this.fileService.userUploadAvatar(file, user.id);
      _user.avatar_url = avatar.url;
      const updatedUser = await this.userModel.save(_user);
      return {
        success: true,
        user: updatedUser,
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async userDeleteAvatar(user: any) {
    const _user = await this.userModel.findOne({ where: { id: user.id } });
    await this.connection.manager
      .getRepository(User)
      .update({ id: _user.id }, { avatar_url: null });

    return {
      success: true,
      message: 'Avatar Deleted Successfully',
    };
  }

  async changeUserRole(userId: string, adminId: string) {
    if (!userId || !adminId) {
      throw new BadRequestException('Both user_id and admin_id are required.');
    }

    const [user, admin] = await Promise.all([
      await this.userModel.findOne({ where: { id: userId } }),
      await this.userModel.findOne({ where: { id: adminId } }),
    ]);

    if (!user || !admin) {
      throw new BadRequestException('User or Admin not found.');
    }

    await Promise.all([
      await this.userModel.update(user.id, { role: 'USER' }),
      await this.userModel.update(admin.id, { role: 'ADMIN' }),
    ]);

    return {
      success: true,
      message: 'Roles updated successfully.',
    };
  }
}
