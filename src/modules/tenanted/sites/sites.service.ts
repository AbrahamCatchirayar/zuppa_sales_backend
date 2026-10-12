/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DataSource, ILike, Repository } from 'typeorm';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { SiteDto, UpdateSiteDto } from './sites.dto';
import { Site } from './sites.entity';
import { BusinessUnit } from '../businessunit/businessunit.entity';

@Injectable()
export class SiteService {
  private siteModel: Repository<Site>;

  private readonly connection: DataSource;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.connection = connection;
    this.siteModel = connection.getRepository(Site);
  }

  async createSite(
    sites: { name: string; location: string }[],
    businessUnitId?: string,
  ) {
    try {
      if (!Array.isArray(sites)) {
        throw new BadRequestException('Sites should be an array');
      }

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
          throw new BadRequestException(`Site "${site.name}" already exists`);
        }

        const newSite = await this.siteModel.save({
          name: site.name,
          location: site.location,
        });

        if (businessUnitId) {
          const businessUnit = await this.connection
            .getRepository(BusinessUnit)
            .findOne({ where: { id: businessUnitId } });

          if (!businessUnit) {
            throw new BadRequestException('Invalid business unit');
          }

          newSite.business_unit = businessUnit;

          await this.siteModel.update(newSite.id, {
            business_unit: businessUnit,
          });
        }

        return newSite;
      });

      const createdSites = await Promise.all(siteCreationPromises);
    } catch (error) {
      throw new BadRequestException(error.message || 'Error creating site');
    }
  }

  async getAllSites(params: any) {
    try {
      const { limit, skip, sort, page, filter } = params;
      const { search, ...otherFilters } = filter;
      const whereConditions = { ...otherFilters, is_deleted: false };
      if (search) {
        whereConditions.name = ILike(`%${search}%`);
      }
      const query = {
        take: limit,
        skip,
        order: sort,
        where: whereConditions,
        relations: ['business_unit'],
      };
      if ('business_unit' in filter) {
        const { business_unit } = filter;
        query.where = {
          ...query.where,
          business_unit: { id: business_unit, is_deleted: false },
        };
        delete filter.business_unit;
      }

      const [data, totalCount] = await this.siteModel.findAndCount(query);

      return {
        sucess: true,
        site: data,
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

  async getSites() {
    try {
      const sites = await this.siteModel.find({ relations: ['business_unit']})
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getSiteById(id: string) {
    try {
      const site = await this.siteModel.findOne({ where: { id } });
      if (!site) {
        throw new BadRequestException('Site not found');
      }

      return { success: true, siteDetails: site };
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async updateSite(id: string, params: UpdateSiteDto) {
    try {
      await this.connection.manager.getRepository(Site).update(id, {
        name: params.name,
        location: params.location,
      });

      const site = await this.siteModel.findOne({
        where: { id },
        relations: ['business_unit'],
      });

      if (!site) {
        throw new BadRequestException('Site not found');
      }

      if (params?.business_unit) {
        const busUnit = this.connection.manager
          .getRepository(BusinessUnit)
          .findOneOrFail({
            where: { id: params.business_unit },
          });

        if (!busUnit) {
          throw new BadRequestException('Invalid business unit');
        }
      }

      return this.siteModel.save(site);
    } catch (error) {
      throw new BadRequestException(error.message || error);
    }
  }

  async deleteSite(id: string) {
    const connection = await this.connection.createQueryRunner();
    try {
      const site = await this.siteModel.findOne({
        where: { id },
        relations: ['business_unit'],
      });
      if (!site) throw new BadRequestException('Site not found');

      if (site.business_unit) {
        const busUnitRepository =
          connection.manager.getRepository(BusinessUnit);
        const businessUnit = await busUnitRepository.findOne({
          where: { id: site.business_unit.id },
          relations: ['sites'],
        });
        if (businessUnit) {
          const updateBusinessUnit = businessUnit.sites.filter(
            (item) => item.id !== site.id,
          );
          businessUnit.sites = updateBusinessUnit;
          await busUnitRepository.save(businessUnit);
        }
      }

      await this.siteModel.update(id, {
        is_deleted: true,
        deleted_at: new Date(),
      });
      return {
        success: true,
        message: `SITE DELETED SUCCESSFULLY`,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
