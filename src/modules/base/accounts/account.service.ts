/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-const */
/* eslint-disable no-shadow */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTenantConnection } from 'src/modules/tenancy/tenancy.utils';
import { ResendInviteAccount } from 'src/modules/tenanted/auth/dto/singup.dto';
import { RoleAccess } from 'src/modules/tenanted/roles/role-access.entity';
import { RoleAccessDto } from 'src/modules/tenanted/roles/role.dto';
import { Role } from 'src/modules/tenanted/roles/role.entity';
import { DataSource, ILike, Not, QueryRunner, Repository } from 'typeorm';
import { AccountStatus } from '../../../enum/account.status';
import { MailServiceRq } from '../../../mail/mail.service';
import { AppDataSource } from '../../../orm_config/public.datasource';
import { tokenGenerator } from '../../../utils';
import { MasterRole } from '../roles/master_tenent_roles/tenent_role.entity';
import { MasterRoleAccess } from '../roles/master_tenent_roles/tenent_role_access.entity';
import { AdminUser } from '../users/user.entity';
import { InviteAccountDto, ReasonDto } from './account.dto';
import { MasterAccount } from './account.entity';

@Injectable()
export class AccountService {
  constructor(
    private readonly mailService: MailServiceRq,
    @InjectRepository(MasterAccount)
    private readonly adminAccountModel: Repository<MasterAccount>,
    private datasource: DataSource,
    @InjectRepository(MasterRole)
    private readonly tenentRoleModel: Repository<MasterRole>,
    @InjectRepository(MasterRoleAccess)
    private readonly tenentRoleAccessModel: Repository<MasterRoleAccess>,
  ) {
    this.tenentRoleModel = this.datasource.getRepository(MasterRole);
    this.tenentRoleAccessModel =
      this.datasource.getRepository(MasterRoleAccess);
  }

  async inviteAccount(body: InviteAccountDto) {
    const querymanager = await AppDataSource.initialize();
    const masterqueryrunner = await querymanager.createQueryRunner();
    let schemaName;
    let error = false;
    let message = 'Error occur while create account';
    try {
      await masterqueryrunner.connect();
      await masterqueryrunner.startTransaction();

      const accountexists = await masterqueryrunner.manager
        .getRepository(MasterAccount)
        .findOne({ where: [{ slug: body.slug }] });

      if (accountexists) {
        throw new BadRequestException(
          `Account already exists please check your url`,
        );
      }
      let account = new MasterAccount();
      const token = await tokenGenerator();
      const api_key = await tokenGenerator();
      account.name = body.name;
      account.account_name = body.account_name;
      account.email = body.email;
      account.slug = body.slug;
      account.api_key = api_key;
      account.status = AccountStatus.PENDING;
      account.invitation_sent_at = new Date();
      account.invitation_token = token;
      account = await masterqueryrunner.manager.save(account);
      schemaName = `tenent_${account.id}`;
      await querymanager.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

      const connection = await getTenantConnection(`${schemaName}`);
      await connection.runMigrations();
      const tenentqueryrunner = connection.createQueryRunner();
      await tenentqueryrunner.connect();
      await tenentqueryrunner.startTransaction();

      try {
        const user = {
          email: body.email,
          name: body.name,
          account_name: body.account_name,
          role: 'ADMIN',
          password: null,
          phone_number: body.phone_number ? body.phone_number : null,
          status: AccountStatus.PENDING,
          invitation_sent_at: new Date(),
          invitation_token: null,
          accept_terms_of_service: true,
        };

        await connection
          .createQueryBuilder(tenentqueryrunner)
          .insert()
          .into('user')
          .values(user)
          .execute();

        const defaultRoles = await this.tenentRoleModel.find();
        await connection
          .createQueryBuilder(tenentqueryrunner)
          .insert()
          .into('roles')
          .values(defaultRoles.map((role) => ({ name: role.name })))
          .execute();

        const accountinfo = {
          account_name: body.account_name,
          slug: body.slug.toLowerCase(),
          email: body.email,
          api_key,
          invitation_sent_at: new Date(),
          invitation_token: token,
          user,
        };
        await connection
          .createQueryBuilder(tenentqueryrunner)
          .insert()
          .into('account')
          .values(accountinfo)
          .execute();

        const defaultRoleAccess = await this.tenentRoleAccessModel.find();
        await connection
          .createQueryBuilder(tenentqueryrunner)
          .insert()
          .into('role_access')
          .values(
            defaultRoleAccess.map((access) => ({
              role: { name: access.role.name },
              module: access.module,
              features: access.features,
            })),
          )
          .execute();

        await masterqueryrunner.commitTransaction();
        await tenentqueryrunner.commitTransaction();
        await this.mailService.send('tenent-invitation', {
          email: account.email,
          name: account.name,
          token,
          slug: body.slug,
          isAccount: true,
          manager_name: 'Rubicr Admin',
        });
      } catch (err) {
        await masterqueryrunner.rollbackTransaction();
        await tenentqueryrunner.rollbackTransaction();
        await querymanager.query(
          `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
        );
        error = true;
        message = err?.message || err;
      } finally {
        await masterqueryrunner.release();
        await tenentqueryrunner.release();
        await connection.destroy();
      }
      if (!error) {
        return { success: true, message: 'Account invited successfully' };
      }
    } catch (err) {
      await masterqueryrunner.rollbackTransaction();
      if (err.code === '23505') {
        if (new String(err.detail).startsWith('Key (name)')) {
          throw new BadRequestException('Organization name already exists.');
        }
        throw new BadRequestException('Email already exists.');
      }
      await querymanager.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      throw new BadRequestException(err?.message || err);
    } finally {
      await masterqueryrunner.release();
      await querymanager.destroy();
    }
    if (error) {
      throw new BadRequestException(message);
    }
  }

  async accountVerifyToken(token: string) {
    const querymanager = await AppDataSource.initialize();
    const queryrunner = querymanager.createQueryRunner();
    let url;
    let error = false;
    let message;
    try {
      await queryrunner.connect();
      await queryrunner.startTransaction();
      const account = await queryrunner.manager
        .getRepository(MasterAccount)
        .findOne({
          where: {
            invitation_token: token,
          },
        });
      if (!account) {
        error = true;
        message = 'TOKEN INVALID';
      }
      url = account;
      await queryrunner.commitTransaction();
    } catch (err) {
      await queryrunner.rollbackTransaction();
      error = err?.message || error;
    } finally {
      await queryrunner.release();
      await querymanager.destroy();
    }
    if (error) {
      throw new BadRequestException(message);
    }
    return {
      success: true,
      account: url,
    };
  }

  async findOne(param: any) {
    return await this.adminAccountModel.findOne({ where: param });
  }

  async findAll(params: any) {
    try {
      const { limit, skip, sort, page, filter } = params;

      const Query = {
        take: limit,
        skip,
        order: sort,
        relations: ['createdBy', 'blocked_by'],
        where: {},
      };

      Query.where = { ...Query.where, status: Not('DELETED') };

      if (filter.status) {
        Object.assign(Query.where, {
          ...(filter.status && { status: filter.status }),
        });
      }

      if (filter.search) {
        Query.where = [
          { ...Query.where, email: ILike(`%${filter.search}%`) },
          { ...Query.where, name: ILike(`%${filter.search}%`) },
        ];
      }

      const [data, totalCount] =
        await this.adminAccountModel.findAndCount(Query);

      return {
        success: true,
        accounts: data,
        meta: {
          currentCount: data.length,
          currentPage: page,
          currentLimit: limit,
          totalCount,
        },
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async getTenantAccount(id: string) {
    try {
      const account = await this.adminAccountModel.findOne({
        where: { id },
      });
      if (!account) {
        throw new BadRequestException(' Account not found ');
      }
      return {
        success: true,
        account,
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async blockAccount(
    param: ReasonDto,
    id: string,
    user: AdminUser,
    isSuspend: boolean,
  ) {
    try {
      const account = await this.adminAccountModel.findOne({ where: { id } });
      if (!account) {
        throw new BadRequestException('Invalid account id');
      }

      if (account.status === 'PENDING') {
        throw new BadRequestException(
          isSuspend
            ? "Can't suspend pending account"
            : "Can't block pending account",
        );
      }
      account.status = isSuspend ? 'SUSPEND' : 'BLOCK';
      if (isSuspend) {
        account.suspended_reason = param.reason;
        account.suspended_on = new Date();
        account.suspended_by = user.id;
      } else {
        account.blocked_reason = param.reason;
        account.blocked_on = new Date();
        account.blocked_by = user.id;
      }

      await this.adminAccountModel.save(account);
      return {
        success: true,
        message: `ACCOUNT ${isSuspend ? 'SUSPEND' : 'BLOCKED'} SUCCESSFULLY`,
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async unBlockAccount(id: string, isSuspend: boolean) {
    try {
      const account = await this.adminAccountModel.findOne({ where: { id } });
      if (!account) {
        throw new BadRequestException('Invalid account id');
      }

      if (account.status !== (isSuspend ? 'SUSPEND' : 'BLOCK')) {
        throw new BadRequestException(
          `Only ${isSuspend ? 'SUSPENDED' : 'BLOCKED'} Account can be ${isSuspend ? 'UNSUSPEND' : 'UN-BLOCK'}`,
        );
      }

      account.status = 'ACTIVE';
      if (isSuspend) {
        account.suspended_by = null;
        account.suspended_on = null;
        account.suspended_reason = null;
      } else {
        account.blocked_by = null;
        account.blocked_on = null;
        account.blocked_reason = null;
      }

      await this.adminAccountModel.save(account);
      return {
        success: true,
        message: `ACCOUNT ${isSuspend ? 'UNSUSPEND' : 'UN-BLOCKED'} SUCCESSFULLY`,
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    }
  }

  async resendInvite(body: ResendInviteAccount) {
    const querymanager = await AppDataSource.initialize();
    const masterqueryrunner = await querymanager.createQueryRunner();
    try {
      await masterqueryrunner.connect();

      const accountExists = await masterqueryrunner.manager
        .getRepository(MasterAccount)
        .findOne({
          where: [{ slug: body.slug, email: body.email }],
        });

      if (!accountExists) {
        throw new BadRequestException('Invalid account');
      }

      if (accountExists.status !== 'PENDING') {
        throw new BadRequestException(
          'Only pending accounts can be re-invited',
        );
      }

      const token = await tokenGenerator();
      accountExists.invitation_token = token;
      accountExists.invitation_sent_at = new Date();
      await masterqueryrunner.manager.save(accountExists);

      await this.mailService.send('confirm_account', {
        email: accountExists.email,
        name: accountExists.name,
        token,
        slug: accountExists.slug,
        isAccount: true,
      });

      return {
        success: true,
        message: 'Account re-invited successfully',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    } finally {
      await masterqueryrunner.release();
      await querymanager.destroy();
    }
  }

  async deleteTenentAccount(id: string, param: ReasonDto, user: AdminUser) {
    try {
      const account = await this.adminAccountModel.findOne({ where: { id } });
      if (!account) {
        throw new BadRequestException('Invalid account');
      }

      if (account.status === 'DELETED') {
        throw new BadRequestException('Account already deleted');
      }

      account.status = 'DELETED';
      account.deleted_reason = param.reason;
      account.deleted_at = new Date();
      account.deleted_by = user.id;

      await this.adminAccountModel.update(id, account);

      return {
        success: true,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async reactivateTenentAccount(id: string) {
    try {
      const account = await this.adminAccountModel.findOne({ where: { id } });
      if (!account) {
        throw new BadRequestException('Invalid account');
      }

      if (account.status !== 'DELETED') {
        throw new BadRequestException(
          'Only deleted account can be re-activate',
        );
      }
      account.status = 'ACTIVE';
      account.deleted_reason = null;
      account.deleted_at = null;
      account.deleted_by = null;

      await this.adminAccountModel.update(id, account);

      return {
        success: true,
        message: 'Account reactivated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async changeTenentRole(id: string, body: RoleAccessDto) {
    let connection: DataSource;
    let schemaName: string;

    schemaName = `tenent_${id}`;
    connection = await getTenantConnection(schemaName);
    await connection.runMigrations();

    const tenantqueryRunner = connection.createQueryRunner();
    await tenantqueryRunner.connect();
    await tenantqueryRunner.startTransaction();

    try {
      const finduser = await this.adminAccountModel.findOne({ where: { id } });
      if (!finduser) {
        throw new BadRequestException('Invalid user');
      }

      if (finduser.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Cant update the role for ${finduser.status} account`,
        );
      }

      const role = await tenantqueryRunner.manager
        .getRepository(Role)
        .find({ where: { name: body.role } });

      if (!role) {
        throw new BadRequestException(`Invalid Role ${body.role}`);
      }

      const roleAcess = await tenantqueryRunner.manager
        .getRepository(RoleAccess)
        .findOne({
          where: { role: { name: body.role }, module: body.module },
        });

      if (!roleAcess) {
        throw new BadRequestException(
          `Invalid Module ${body.module} or Role ${body.role}`,
        );
      }
      const role_access = await tenantqueryRunner.manager
        .getRepository(RoleAccess)
        .save({
          ...roleAcess,
          features: body.features,
        });
      await tenantqueryRunner.commitTransaction();
      return { success: true, role_access };
    } catch (error) {
      await tenantqueryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await tenantqueryRunner.release();
    }
  }

  async getTenentRolesByTenentId(id: string) {
    let connection: DataSource;
    try {
      const findUser = await this.adminAccountModel.findOne({ where: { id } });
      if (!findUser) throw new BadRequestException('Invalid user');

      const schemaName = `tenent_${findUser.id}`;

      connection = await getTenantConnection(schemaName);

      const roles = await connection.getRepository(Role).find();
      const roleNames = roles.map((role) => role.name);
      return {
        success: true,
        roles: roleNames,
      };
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to fetch tenant roles',
      );
    } finally {
      await connection.destroy();
    }
  }

  async getTenentRoleAccessByTenentId(id: string) {
    let connection: DataSource;
    let schemaName: string;

    schemaName = `tenent_${id}`;
    connection = await getTenantConnection(schemaName);
    await connection.runMigrations();

    const tenantqueryRunner = connection.createQueryRunner();
    await tenantqueryRunner.connect();
    await tenantqueryRunner.startTransaction();
    try {
      const findUser = await this.adminAccountModel.findOne({ where: { id } });
      if (!findUser) throw new BadRequestException('Invalid user');

      const schemaName = `tenent_${findUser.id}`;

      connection = await getTenantConnection(schemaName);

      const roles = await this.findall(connection);
      const response = await Promise.all(
        roles.map(async (name) => ({
          [name]: await this.getByRole(name, connection),
        })),
      );

      const access_response = {};
      response.forEach((role) => {
        const key = Object.keys(role)[0];
        access_response[key] = role[key];
      });
      await tenantqueryRunner.commitTransaction();
      return access_response;
    } catch (error) {
      await tenantqueryRunner.rollbackTransaction();
      throw new BadRequestException(error?.message);
    } finally {
      await tenantqueryRunner.release();
      await connection.destroy();
    }
  }

  async findall(connection: DataSource) {
    return (await connection.getRepository(Role).find()).map((obj) => {
      return obj.name;
    });
  }

  async getByRole(role: string, connection: DataSource) {
    const _role = await connection
      .getRepository(Role)
      .findOne({ where: { name: role } });

    if (!_role) {
      throw new BadRequestException('invalid Role');
    }
    const access = await this.find(role, connection);

    const response = {};

    access.forEach(({ features, module }) => {
      response[module] = features;
    });

    return response;
  }

  async find(role: any, connection: DataSource) {
    return await connection.getRepository(RoleAccess).find({
      where: { role: { name: role } },
      select: ['features', 'module'],
    });
  }

  async getRoleAccess() {
    const roles = await this.tenentRoleModel.find();
    const roleAccess = await this.tenentRoleAccessModel.find({
      relations: ['role'],
      select: ['features', 'module', 'role'],
    });

    const roleAccessMap = {};

    // Group access by role
    roles.forEach((role) => {
      roleAccessMap[role.name] = {};

      // Filter access for this role
      const roleAccessList = roleAccess.filter(
        (access) => access.role.name === role.name,
      );

      // Group by module
      roleAccessList.forEach((access) => {
        roleAccessMap[role.name][access.module] = access.features;
      });
    });

    return {
      success: true,
      role_access: roleAccessMap,
    };
  }

  async getByRole_(role: string) {
    const _role = await this.datasource
      .getRepository(Role)
      .findOne({ where: { name: role } });

    if (!_role) {
      throw new BadRequestException('invalid Role');
    }
    const access = await this.datasource.getRepository(RoleAccess).find({
      where: { role: { name: role } },
      select: ['features', 'module'],
    });

    const response = {};

    access.forEach(({ features, module }) => {
      response[module] = features;
    });

    return response;
  }

  async updateRoleAccess(body: RoleAccessDto) {
    try {
      const roleAccess = await this.tenentRoleAccessModel.findOne({
        where: { role: { name: body.role }, module: body.module },
        relations: ['role'],
        select: ['id', 'features', 'module'],
      });

      if (!roleAccess) {
        throw new BadRequestException(
          `Invalid role access for role ${body.role} and module ${body.module}`,
        );
      }

      // Update the role access with new values
      const updatedRoleAccess = await this.tenentRoleAccessModel.save({
        id: roleAccess.id,
        features: body.features,
      });

      return {
        success: true,
        message: 'Role access updated successfully',
        data: updatedRoleAccess,
      };
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to update role access',
      );
    }
  }

  async findMasterRoles(queryrunner: QueryRunner) {
    const defaultRoles = await this.tenentRoleModel.find();
    await queryrunner.manager.getRepository(Role).save(defaultRoles);
  }

  async findMasterRoleAccess(queryrunner: QueryRunner) {
    const defaultRoleAccess = await this.tenentRoleAccessModel.find({
      relations: ['role'],
    });
    await queryrunner.manager.getRepository(RoleAccess).save(
      defaultRoleAccess.map((access) => ({
        role: { name: access.role.name },
        module: access.module,
        features: access.features,
      })),
    );
  }

  async resetRoleAndAccess(id: string) {
    const schemaName = `tenent_${id}`;
    const connection = await getTenantConnection(schemaName);
    await connection.runMigrations();

    const tenantqueryRunner = connection.createQueryRunner();
    await tenantqueryRunner.connect();
    await tenantqueryRunner.startTransaction();
    try {
      const findUser = await this.adminAccountModel.findOne({ where: { id } });
      if (!findUser) throw new BadRequestException('Invalid user');

      // // Delete existing role access
      await tenantqueryRunner.manager.getRepository(RoleAccess).clear();
      // await tenantqueryRunner.manager
      //   .getRepository(RoleAccess)
      //   .createQueryBuilder()
      //   .delete()
      //   .execute();

      // // // Delete existing roles
      // await tenantqueryRunner.manager
      //   .getRepository(Role)
      //   .createQueryBuilder()
      //   .delete()
      //   .execute();

      await this.findMasterRoles(tenantqueryRunner);
      await this.findMasterRoleAccess(tenantqueryRunner);

      await tenantqueryRunner.commitTransaction();
      return {
        success: true,
        message: 'Roles and role access reset successfully',
      };
    } catch (error) {
      await tenantqueryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await tenantqueryRunner.release();
      await connection.destroy();
    }
  }
}
