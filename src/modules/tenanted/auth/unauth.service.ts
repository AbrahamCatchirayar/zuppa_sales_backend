/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-new-wrappers */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/await-thenable */

import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { env } from 'src/config';
import { AccountStatus } from 'src/enum/account.status';
import { MailServiceRq } from 'src/mail/mail.service';
import { MasterAccount } from 'src/modules/base/accounts/account.entity';
import { getTenantConnection } from 'src/modules/tenancy/tenancy.utils';
import { DataSource } from 'typeorm';
import { MasterRole } from 'src/modules/base/roles/master_tenent_roles/tenent_role.entity';
import { MasterRoleAccess } from 'src/modules/base/roles/master_tenent_roles/tenent_role_access.entity';
import { AppDataSource } from '../../../orm_config/public.datasource';
import { tokenGenerator } from '../../../utils';
import { User } from '../user/entities/user.entity';
import {
  AcceptAccountInvitationDTO,
  ResendInviteAccount,
  SignUpDTO,
} from './dto/singup.dto';

@Injectable()
export class UnAuthService {
  constructor(
    private readonly mailService: MailServiceRq,
    // @InjectDataSource()
    private datasource: DataSource,
  ) {}

  async signUp(payload: SignUpDTO, isVerify = false) {
    const querymanager = await AppDataSource.initialize();
    const masterQueryrunner = querymanager.createQueryRunner();
    let schemaName;
    let error = false;
    let message = 'Error Occur While Create Account';

    await masterQueryrunner.connect();
    await masterQueryrunner.startTransaction();
    const token = tokenGenerator();
    const api_Key = tokenGenerator();
    try {
      const accountcheck = await masterQueryrunner.manager
        .getRepository(MasterAccount)
        .findOne({
          where: {
            slug: payload.slug,
          },
        });

      if (accountcheck) {
        throw new BadRequestException('Account already exists');
      }
      let account = new MasterAccount();
      account.name = payload.name;
      account.account_name = payload.account_name;
      account.email = payload.email;
      account.slug = payload.slug.toLowerCase();
      account.api_key = api_Key;
      account.status = isVerify ? AccountStatus.ACTIVE : AccountStatus.PENDING;
      account.invitation_sent_at = new Date();
      account.invitation_token = isVerify ? null : token;

      account = await masterQueryrunner.manager.save(account);

      schemaName = `tenent_${account.id}`;

      await querymanager.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

      const connection = await getTenantConnection(schemaName);
      await connection.runMigrations();

      const tenentqueryrunner = connection.createQueryRunner();

      await tenentqueryrunner.connect();
      await tenentqueryrunner.startTransaction();
      try {
        const userinfo = {
          email: payload.email,
          name: payload.name,
          account_name: payload.account_name,
          role: 'ADMIN',
          password: !isVerify ? payload.password : null,
          status: isVerify ? AccountStatus.ACTIVE : AccountStatus.PENDING,
          invitation_sent_at: new Date(),
          invitation_token: null,
          accept_terms_of_service: true,
        };

        await tenentqueryrunner.manager
          .getRepository(User)
          .save(Object.assign(new User(), userinfo));

        // First get all default roles
        const defaultRoles = await masterQueryrunner.manager
          .getRepository(MasterRole)
          .find();

        // Insert roles first
        await tenentqueryrunner.manager
          .getRepository('roles')
          .save(defaultRoles.map((role) => ({ name: role.name })));

        const user = await tenentqueryrunner.manager
          .getRepository(User)
          .findOne({ where: { email: payload.email } });

        const accountinfo = {
          account_name: payload.account_name,
          email: payload.email,
          slug: payload.slug.toLowerCase(),
          api_key: api_Key,
          invitation_sent_at: new Date(),
          invitation_token: isVerify ? null : token,
          user,
        };

        await connection
          .createQueryBuilder(tenentqueryrunner)
          .insert()
          .into('account')
          .values(accountinfo)
          .execute();

        // Get role access data with relations
        const defaultRoleAccess = await masterQueryrunner.manager
          .getRepository(MasterRoleAccess)
          .find({
            relations: ['role'],
            select: ['module', 'features', 'role'],
          });

        // Create role access entries
        await tenentqueryrunner.manager.getRepository('role_access').save(
          defaultRoleAccess.map((access) => ({
            role: { name: access.role.name },
            module: access.module,
            features: access.features,
          })),
        );

        await masterQueryrunner.commitTransaction();
        await tenentqueryrunner.commitTransaction();

        this.mailService.send('confirm_account', {
          email: payload.email,
          name: payload.name,
          token,
          slug: payload.slug,
          isAccount: true,
        });
      } catch (err) {
        await masterQueryrunner.rollbackTransaction();
        await tenentqueryrunner.rollbackTransaction();

        await querymanager.query(
          `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
        );
        error = true;
        message = err?.message || err;
      } finally {
        await masterQueryrunner.release();
        await tenentqueryrunner.release();
        await connection.destroy();
      }
    } catch (err) {
      await masterQueryrunner.rollbackTransaction();
      if (err.code === '23505') {
        if (new String(err.detail).startsWith('Key (name)')) {
          throw new BadRequestException('Organization name already exists.');
        }
        throw new BadRequestException('Email already exists.');
      }
      await querymanager.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(err?.message || err);
    } finally {
      await masterQueryrunner.release();
      await querymanager.destroy();
    }
    if (error) {
      throw new BadRequestException(message);
    }
    return {
      success: true,
      message: 'Account Invite send successfully',
      invitation_token: isVerify ? null : token,
    };
  }

  async resendInvite(body: ResendInviteAccount) {
    const queryrunner = await this.datasource.createQueryRunner();
    try {
      await queryrunner.connect();

      const accountExists = await queryrunner.manager
        .getRepository(MasterAccount)
        .findOne({
          where: [{ slug: body.slug, email: body.email }],
        });

      if (!accountExists) {
        throw new BadRequestException('Invalid account');
      }

      if (accountExists.status !== 'PENDING') {
        throw new BadRequestException('Only pending account can be re-invited');
      }

      const token = await tokenGenerator();
      accountExists.invitation_token = token;
      accountExists.invitation_sent_at = new Date();
      await queryrunner.manager.save(accountExists);

      await this.mailService.send('confirm_account', {
        email: accountExists.email,
        name: accountExists.name,
        token,
        slug: accountExists.slug,
      });

      return {
        success: true,
        message: 'Account re-invited successfully',
      };
    } catch (err) {
      throw new BadRequestException(err.message || err);
    } finally {
      await queryrunner.release();
    }
  }

  async accountConfirmation(
    token: string,
    body: AcceptAccountInvitationDTO = null,
  ) {
    const querymanager = await AppDataSource.initialize();
    const queryrunner = await querymanager.createQueryRunner();
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
        message = 'Token invalid';
      }
      await querymanager.manager.getRepository(MasterAccount).update(
        { id: account.id },
        {
          status: AccountStatus.ACTIVE,
          invitation_token: null,
          confirmed_at: new Date(),
        },
      );

      const schemaName = `tenent_${account.id}`;
      const connection = await getTenantConnection(`${schemaName}`);
      const tenentqueryrunner = connection.createQueryRunner();
      await tenentqueryrunner.connect();
      await tenentqueryrunner.startTransaction();
      try {
        // const user = await tenentqueryrunner.manager
        //   .getRepository(User)
        //   .findOne({ where: { invitation_token: token } });
        const userpayload = {
          confirmed_at: new Date(),
          invitation_token: null,
          status: AccountStatus.ACTIVE,
          accept_terms_of_service: true,
        };

        if (body) {
          (userpayload as unknown as { password: string }).password =
            await bcrypt.hash(body.password, 10);
        }

        await tenentqueryrunner.manager
          .getRepository(User)
          .update({ status: AccountStatus.PENDING }, userpayload);

        // const accountInfo = await tenentqueryrunner.manager
        //   .getRepository(Account)
        //   .findOne({ where: { email: user.email } });

        // await tenentqueryrunner.manager
        //   .getRepository(Account)
        //   .update(accountInfo.id, { user });

        await tenentqueryrunner.commitTransaction();
        url = `https://${account.slug}.${env.frontend_base_uri}/sign_in`;
      } catch (err) {
        await tenentqueryrunner.rollbackTransaction();
        await queryrunner.rollbackTransaction();
        error = err.message || error;
      } finally {
        await tenentqueryrunner.release();
        await connection.destroy();
      }
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
    return url;
  }

  async slugchecker(slugname: string) {
    const queryrunner = this.datasource.createQueryRunner();
    try {
      await queryrunner.connect();
      const account = await queryrunner.manager
        .getRepository(MasterAccount)
        .count({ where: { slug: slugname } });
      if (account > 0 || slugname === 'admin') {
        return { success: false, message: 'Slug not available' };
      }
      return { success: true, message: 'Slug available' };
    } catch (err) {
      return { success: false, message: 'Error occur while fetch slug' };
    } finally {
      await queryrunner.release();
    }
  }
}
