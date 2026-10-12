/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FileService } from 'src/file-storage/file-storage.service';
import { ILike, Not, Repository } from 'typeorm';
import * as CONFIG from '../../../config.json';
import { UserStatus } from '../../tenanted/user/enums/tenentuser.enum';
import { MailServiceRq } from '../../../mail/mail.service';
import {
  comparePassword,
  default_tenent_role_access,
  get_tenent_roles,
  tokenGenerator,
} from '../../../utils';
import { AdminUser } from './user.entity';
import { AdminRoleService } from '../roles/role.service';
import {
  ResetPasswordDTO,
  AdminUserDto,
  InvitationAdminDto,
  AdminResendInvitationDto,
  ChangeAdminPasswordDto,
  UpdateAdminUserDto,
  Reason,
} from '../auth/auth.dto';
import { MasterRole } from '../roles/master_tenent_roles/tenent_role.entity';
import { MasterRoleAccess } from '../roles/master_tenent_roles/tenent_role_access.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly userModel: Repository<AdminUser>,
    private readonly roleService: AdminRoleService,
    private readonly mailService: MailServiceRq,
    private readonly fileService: FileService,
    @InjectRepository(MasterRole)
    private readonly tenentRoleModel: Repository<MasterRole>,
    @InjectRepository(MasterRoleAccess)
    private readonly tenentRoleAccessModel: Repository<MasterRoleAccess>,
  ) {}

  async onModuleInit() {
    await this.roleService.init();
    // await this.tenentRoleService.init();
    // await this.tenentRoleAccessService.init();

    const superAdmin = await this.getSuperAdmin();

    if (!superAdmin) {
      await this.createUser({ ...CONFIG.SUPERADMIN, confirmed_at: new Date() });
    }

    // const defaultRoles = await this.getTenentRoles();
    // const defaultRoleAccess = await this.getTenentRoleAccess();

    // if (!defaultRoles) {
    //   const roles = get_tenent_roles();
    //   await this.tenentRoleModel.save(roles);
    // }

    // if (!defaultRoleAccess) {
    //   const roleAccess = await default_tenent_role_access();
    //   await this.tenentRoleAccessModel.save(roleAccess);
    // }
  }

  async getTenentRoleAccess() {
    const count = await this.tenentRoleAccessModel.count();
    return count > 0;
  }

  async getTenentRoles() {
    const count = await this.tenentRoleModel.count();
    return count > 0;
  }

  async getSuperAdmin() {
    if ((await this.userModel.count()) !== 0) {
      return true;
    }
    return false;
  }

  async createUser(body) {
    return await this.userModel.save(Object.assign(new AdminUser(), body));
  }

  async findOne(param, select = null) {
    return await this.userModel.findOne({
      where: param,
      select,
      relations: ['role'],
    });
  }

  async updateUser(condition: any, payload: any) {
    return await this.userModel.update(condition, payload);
  }

  async verifyUserToken(token: string) {
    try {
      const user = await this.findOne({ invitation_token: token });
      if (!user) {
        throw new BadRequestException('Invalid token');
      }
      return { success: true, user };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async forgetPassword(email: string) {
    try {
      const user = await this.userModel.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      user.forget_password_token = tokenGenerator();
      user.forget_password_token_sent_at = new Date();
      await this.userModel.save(user);

      await this.mailService.send('admin-forgot_password', {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        token: user.forget_password_token,
        isAccount: true,
      });
      return {
        success: true,
        message: 'Please check your mail for reset password link',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async resetPassword(params: ResetPasswordDTO) {
    try {
      const { token, password, passwordConfirmation } = params;
      const user = await this.userModel.findOne({
        where: { forget_password_token: token },
      });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      if (passwordConfirmation !== password) {
        throw new BadRequestException(
          'Password and password confirmation does not match',
        );
      }

      user.password = await bcrypt.hash(password, 10);
      user.forget_password_token = null;
      user.password_reset_on = new Date();
      await this.userModel.save(user);
      return {
        success: true,
        message: 'PASSWORD RESETED SUCCESFULLY',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async acceptInvitation(token: string, params: AdminUserDto) {
    try {
      const user = await this.userModel.findOne({
        where: { invitation_token: token },
      });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      if (params.password !== params.confirm_password) {
        throw new BadRequestException(
          'Password and password confirmation does not match',
        );
      }

      user.password = await bcrypt.hash(params.password, 10);
      user.first_name = params.first_name;
      user.last_name = params.last_name;
      user.accept_terms_of_service = params.accept_terms_and_conditions;
      user.confirmed_at = new Date();
      user.invitation_token = null;
      user.status = 'ACTIVE';
      user.phone_number = params.phone_number;
      await this.userModel.save(user);
      return {
        success: true,
        message: 'ACCOUNT CREATED SUCCESSFULLY',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async inviteUser(params: InvitationAdminDto, id: string) {
    try {
      const user = await this.userModel.findOne({
        where: { email: params.email },
      });

      if (user) {
        throw new BadRequestException('User already invited');
      }

      const admin = {
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        invitation_token: await tokenGenerator(),
        invitation_token_sent_at: new Date(),
        created_by: id,
        created_by_type: 'ADMIN',
        role: params.role,
        status: UserStatus.PENDING,
      };

      await this.userModel.save(Object.assign(new AdminUser(), admin));

      await this.mailService.send('admin-invitation', {
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        token: admin.invitation_token,
        isAccount: true,
      });
      return {
        success: true,
        admin,
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async resendInvite(id: string, params: AdminResendInvitationDto) {
    try {
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
          throw new BadRequestException('Email already exist');
        }

        user.email = params.email;
      }

      user.invitation_token = tokenGenerator();
      user.invitation_token_sent_at = new Date();
      await this.userModel.save(user);

      this.mailService.send('admin-invitation', {
        token: user.invitation_token,
        email: user.email,
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

  async changePassword(id: string, params: ChangeAdminPasswordDto) {
    try {
      const { oldPassword, password, passwordConfirmation } = params;

      if (password !== passwordConfirmation) {
        throw new BadRequestException(
          'Password and password confirmation does not match',
        );
      }

      const response = await this.userModel.findOne({
        where: { id },
        select: ['password'],
      });

      const isEqual = await comparePassword(response.password, oldPassword);
      if (!isEqual) {
        throw new BadRequestException('Old password does not match');
      }

      if (oldPassword === password) {
        throw new BadRequestException(
          'Password must not be same as old password',
        );
      }

      response.password = await bcrypt.hash(password, 10);
      await this.userModel.update({ id }, response);
      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async update(id: string, params: UpdateAdminUserDto) {
    try {
      await this.userModel.update({ id }, params);
      return {
        success: true,
        admin: await this.userModel.findOne({ where: { id } }),
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async updateUserByUserId(id: string, params: UpdateAdminUserDto) {
    try {
      const user = await this.userModel.findOne({
        where: { id },
        // relations: ['role'],
      });

      if (!user) {
        throw new BadRequestException('Invalid admin');
      }
      const updatedAdmin = await this.userModel.update({ id }, params);
      return {
        success: true,
        updatedAdmin,
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async blockUser(id: string, params: Reason) {
    try {
      const admin = await this.userModel.findOne({ where: { id } });
      if (!admin) {
        throw new BadRequestException('Invalid admin');
      }

      if (admin.status === UserStatus.BLOCKED) {
        throw new BadRequestException('Admin already blocked');
      } else if (admin.status === UserStatus.ACTIVE) {
        admin.blocked_reason = params.blocked_reason;
        admin.blocked_on = new Date();
        admin.status = UserStatus.BLOCKED;
        await this.userModel.save(admin);
        return {
          success: true,
          message: 'ADMIN BLOCKED',
        };
      } else {
        throw new BadRequestException('Only active admin can be blocked');
      }
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async unBlockUser(id: string) {
    try {
      const admin = await this.userModel.findOne({ where: { id } });
      if (!admin) {
        throw new BadRequestException('Invalid admin');
      }

      if (admin.status !== UserStatus.BLOCKED) {
        throw new BadRequestException('Only blocked admin can be un-block');
      }

      admin.status = UserStatus.ACTIVE;
      admin.blocked_reason = null;
      admin.blocked_on = null;
      await this.userModel.save(admin);
      return { success: true, message: 'ADMIN UN-BLOCKED' };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async delete(id: string) {
    try {
      const admin = await this.userModel.findOne({ where: { id } });

      if (!admin) {
        throw new BadRequestException('Admin not found');
      }

      await this.userModel.delete(admin.id);
      return {
        success: true,
        message: 'Deleted admin successfully',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async findAllUser(params: any) {
    try {
      const { limit, skip, sort, page, filter } = params;
      const Query = {
        take: limit,
        skip,
        order: sort,
        where: {},
      };

      Query.where = { ...Query.where, status: Not('DELETED') };

      if (filter.status) {
        Object.assign(Query.where, {
          ...(filter.status && { status: filter.status }),
        });
      }

      if (filter.role) {
        Object.assign(Query.where, {
          ...(filter.role && { role: filter.role }),
        });
      }

      if (filter.search) {
        Query.where = [
          { ...Query.where, email: ILike(`%${filter.search}%`) },
          {
            ...Query.where,
            first_name: ILike(`%${filter.search}%`),
          },
          {
            ...Query.where,
            last_name: ILike(`%${filter.search}%`),
          },
        ];
      }

      const [data, totalCount] = await this.userModel.findAndCount(Query);

      return {
        success: true,
        users: data,
        meta: {
          currentCount: data.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async uploadAvatar(user: any, file: any) {
    try {
      const admin = await this.userModel.findOne({
        where: { id: user.id },
      });
      const avatar = await this.fileService.adminUploadAvatar(user.id, file);

      admin.avatar_url = avatar.url;

      const updatedAdmin = await this.userModel.save(admin);
      return {
        success: true,
        account: updatedAdmin,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async deleteAvatar(user: any) {
    const admin = await this.userModel.findOne({ where: { id: user.id } });
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    await this.userModel.update({ id: admin.id }, { avatar_url: null });

    return {
      success: true,
      message: 'Avatar Deleted Successfully',
    };
  }
}
