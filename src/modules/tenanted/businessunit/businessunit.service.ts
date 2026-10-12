/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable prettier/prettier */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { DataSource, ILike, Repository } from 'typeorm';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { Account } from '../account/account.entity';
import { Site } from '../sites/sites.entity';
import {
  BasicBusinessUnitDto,
  UpdateBusinessUnitDto,
} from './businessunit.dto';
import { BusinessUnit } from './businessunit.entity';

@Injectable()
export class BusinessUnitService {
  private readonly businessUnitModel: Repository<BusinessUnit>;

  private readonly siteModel: Repository<Site>;

  private readonly connection: DataSource;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.connection = connection;
    this.businessUnitModel = connection.getRepository(BusinessUnit);
    this.siteModel = connection.getRepository(Site);
  }

  async createBusinessUnit(
    params: BasicBusinessUnitDto[],
    user,
    queryParams: {
      onboarding: string;
    },
  ) {
    const connection = await this.connection.createQueryRunner();
    await connection.startTransaction();

    try {
      const account = await connection.manager
        .getRepository(Account)
        .findOne({ where: { id: user.account.id } });
      for (const businessUnitData of params) {
        const { name: businessUnitName, sites } = businessUnitData;

        const existingBusinessUnit = await this.businessUnitModel.findOne({
          where: { name: businessUnitName },
        });

        if (existingBusinessUnit) {
          if (existingBusinessUnit.is_deleted) {
            existingBusinessUnit.is_deleted = false;
            existingBusinessUnit.deleted_at = null;
            await connection.manager
              .getRepository(BusinessUnit)
              .update(existingBusinessUnit.id, existingBusinessUnit);
            const existingSite = await this.businessUnitModel.findOne({
              where: { id: existingBusinessUnit.id },
              relations: ['sites'],
            });

            const siteCreationPromises = existingSite.sites.map(
              async (site) => {
                site.is_deleted = false;
                site.deleted_at = null;
                await connection.manager
                  .getRepository(Site)
                  .update(site.id, site);
              },
            );
            await Promise.all(siteCreationPromises);
          } else {
            throw new BadRequestException(
              `Business unit "${businessUnitName}" already exists`,
            );
          }
        } else {
          const businessUnit = await connection.manager
            .getRepository(BusinessUnit)
            .save({
              name: businessUnitName,
              account,
            });

          if (sites && sites.length > 0) {
            const siteCreationPromises = sites.map(async (site) => {
              if (!site.name || !site.location) {
                throw new BadRequestException(
                  'Each site must have a name and location',
                );
              }

              const existingSite = await this.siteModel.findOne({
                where: { name: site.name },
              });

              if (existingSite) {
                throw new BadRequestException(
                  `Site "${site.name}" already exists`,
                );
              }
              if (businessUnit.id) {
                await connection.manager.getRepository(Site).save({
                  name: site.name,
                  location: site.location,
                  business_unit: businessUnit,
                });
              }
            });

            await Promise.all(siteCreationPromises);
          }
        }
      }
      let updatedAccount;
      if (
        queryParams?.onboarding === 'true' &&
        account?.current_onboarding_stage === 1
      ) {
        updatedAccount = await connection.manager
          .getRepository(Account)
          .update(account.id, { current_onboarding_stage: 2 });
      }
      await connection.commitTransaction();
      return {
        success: true,
        onboarding: updatedAccount?.onboarding,
        message: 'Business Unit created successfully with associated sites',
      };
    } catch (err) {
      await connection.rollbackTransaction();
      throw new BadRequestException(
        err.message || 'Error creating business unit',
      );
    } finally {
      await connection.release();
    }
  }

  async getAllBusinessUnits(params: any) {
    try {
      const { limit, skip, sort, page, filter } = params;
      const whereConditions: any = {
        is_deleted: filter.is_deleted !== undefined ? filter.is_deleted : false,
      };
      const query = {
        take: limit,
        skip,
        order: sort,
        where: whereConditions,
        relations: ['sites', 'account'],
      };
      if ('search' in filter) {
        const { search } = filter;
        delete filter.search;
        const queryArray = [{ name: ILike(`%${search}%`) }];

        query.where = queryArray;
      } else {
        query.where = { ...filter, is_deleted: false };
      }

      const [data, totalCount] =
        await this.businessUnitModel.findAndCount(query);

      return {
        sucess: true,
        businessUnit: data,
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

  async findone(id: string) {
    const businessUnit = await this.businessUnitModel.findOne({
      where: { id },
      relations: ['sites'],
    });
    if (businessUnit.is_deleted === true || !businessUnit) {
      throw new BadRequestException('Bussiness unit not found');
    }
    return businessUnit;
  }

  async getBusinessUnitById(id: string) {
    try {
      const businessUnit = await this.findone(id);

      return { success: true, businessUnitDetails: businessUnit };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async updateBusinessUnit(id: string, params: UpdateBusinessUnitDto) {
    const queryRunner = await this.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const _businessUnit = await this.findone(id);

      await queryRunner.manager.getRepository(BusinessUnit).update(id, {
        name: params.name,
      });

      if (params?.sites?.length > 0) {
        const unmatchedSites = _businessUnit?.sites.filter(
          (site) => !params?.sites?.map((s) => s.id).includes(site?.id),
        );

        const siteUpdates = params.sites.map(async (siteParams) => {
          if (!siteParams.id && siteParams.name) {
            if (_businessUnit.id) {
              await queryRunner.manager.getRepository(Site).save({
                name: siteParams.name,
                location: siteParams.location,
                business_unit: _businessUnit,
              });
            }
          } else {
            const _site = await queryRunner.manager
              .getRepository(Site)
              .findOne({
                where: { id: siteParams.id },
              });
            if (!_site) {
              throw new BadRequestException('Invalid site');
            }

            const updatedData: Partial<Site> = {};
            if (siteParams.name) {
              updatedData.name = siteParams.name;
            }
            if (siteParams.location) {
              updatedData.location = siteParams.location;
            }

            if (Object.keys(updatedData).length > 0) {
              await queryRunner.manager
                .getRepository(Site)
                .update(siteParams.id, updatedData);
            }
          }
        });

        await Promise.all(siteUpdates);
        if (unmatchedSites?.length > 0) {
          const res = unmatchedSites.map(async (sites) => {
            const _site = await queryRunner.manager
              .getRepository(Site)
              .findOne({ where: { id: sites?.id } });

            if (!_site || _site.business_unit) {
              throw new BadRequestException('Invalid site ');
            }
            await queryRunner.manager
              .getRepository(Site)
              .update(_site.id, { business_unit: null });
          });
          await Promise.all(res);
        }
      }
      // await queryRunner.manager.getRepository(BusinessUnit).update(id, { name:params.name});
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'BUSINESS UNIT UPDATED SUCCESSFULLY ',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteBusinessUnit(id: string) {
    const connection = this.connection.createQueryRunner();
    try {
      const businessUnit = await this.findone(id);
      if (businessUnit.sites) {
        await Promise.all(
          businessUnit.sites.map(async (site) => {
            if (site.is_deleted) {
              throw new BadRequestException("Can't delete a deleted site");
            }
            await connection.manager.getRepository(Site).update(site.id, {
              is_deleted: true,
              deleted_at: new Date(),
              business_unit: null,
            });
          }),
        );
      }
      await this.businessUnitModel.update(id, {
        is_deleted: true,
        deleted_at: new Date(),
        account: null,
      });

      return {
        success: true,
        message: 'BUSINESS UNIT DELETED SUCCESSFULLY',
      };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }
}
