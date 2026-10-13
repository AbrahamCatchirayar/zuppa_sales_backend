/* eslint-disable prefer-const */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MasterAccount } from 'src/modules/base/accounts/account.entity';
import { AppDataSource } from 'src/orm_config/public.datasource';
import { DataSource, Repository } from 'typeorm';
import { CONNECTION } from '../../tenancy/tenancy.symbol';
import { CompanyDetailsDto } from '../auth/dto/company-details.dto';
import { Account } from './account.entity';

@Injectable()
export class AccountService {
  private readonly accountModel: Repository<Account>;

  private readonly connection: DataSource;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.connection = connection;
    this.accountModel = connection.getRepository(Account);
  }

  async findOne() {
    return this.accountModel.find();
  }

  async findAccount(user) {
    const account = await this.accountModel.findOne({
      where: { id: user.account.id },
    });
    return account;
  }

  async updateCompanyDetails(id: any, params: any) {
    try {
      const companyInfo = await this.accountModel.find();
      const querymanager = await AppDataSource.initialize();
      const masterQueryrunner = querymanager.createQueryRunner();
      try {
        await masterQueryrunner.connect();
        await masterQueryrunner.startTransaction();
        const accountcheck = await masterQueryrunner.manager
          .getRepository(MasterAccount)
          .findOne({
            where: {
              slug: companyInfo[0].slug,
            },
          });
        if (!companyInfo[0]) {
          throw new Error('Account not found');
        }

        const companyPayload = {
          account_name: params.account_name,
          official_email_id: params.official_email_id,
          website_url: params.company_website_url,
          tax_id: params.tax_id,
          phone_number: params.phone_number,
          address: params.address,
          current_onboarding_stage: params.onboarding,
          standards: params.standards,
          sectors: params.sectors,
          industries: params.industries,
        };

        const masterParams = {
          ...companyPayload,
        };

        if (masterParams.current_onboarding_stage) {
          delete masterParams.current_onboarding_stage;
        }

        if (masterParams.standards) {
          delete masterParams.standards;
        }

        if (masterParams.sectors) {
          delete masterParams.sectors;
        }

        if (masterParams.industries) {
          delete masterParams.industries;
        }

        await masterQueryrunner.manager.update(
          MasterAccount,
          accountcheck.id,
          masterParams,
        );
        const account = await this.accountModel.findOne({ where: { id } });

        const payload = companyPayload;
        if (account.current_onboarding_stage === 0) {
          payload.current_onboarding_stage = 1;
        }

        if (
          account.current_onboarding_stage === 2 &&
          params.standards?.length > 0
        ) {
          payload.current_onboarding_stage = 3;
          payload.standards = params.standards;
        }
        await this.accountModel.update({ id }, payload);
        await masterQueryrunner.commitTransaction();
      } catch (err) {
        await masterQueryrunner.rollbackTransaction();
        throw new BadRequestException('Company details not update.');
      } finally {
        await masterQueryrunner.release();

        await querymanager.destroy();
      }
      return {
        success: true,
        message: 'Company details updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateAvatar(account: Account) {
    return await this.accountModel.save(account);
  }

  async updateOnboarding(id: string, onboarding: number) {
    return await this.accountModel.update(
      { id },
      { current_onboarding_stage: onboarding },
    );
  }
}
