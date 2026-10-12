/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable no-return-await */

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterRoleAccess } from 'src/modules/base/roles/master_tenent_roles/tenent_role_access.entity';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { AppDataSource } from 'src/orm_config/public.datasource';
import { DataSource, Repository } from 'typeorm';
import { RoleAccess } from './role-access.entity';
import { RoleAccessService } from './role-access.service';
import { RoleAccessDto, ValidateAccessDto } from './role.dto';
import { Role } from './role.entity';

@Injectable()
export class RoleService {
  private readonly rolemodel: Repository<Role>;

  private readonly connection: DataSource;

  constructor(
    @Inject(CONNECTION) connection: DataSource,
    private readonly roleAccess: RoleAccessService,
    // @InjectRepository(MasterRole)
    // private readonly masterRoleModel: Repository<MasterRole

    @InjectRepository(RoleAccess)
    private readonly tenentRoleAccessModel: Repository<RoleAccess>,
  ) {
    this.connection = connection;
    this.rolemodel = connection.getRepository(Role);
    // this.masterRoleModel = connection.getRepository(MasterRole);
    this.tenentRoleAccessModel = connection.getRepository(RoleAccess);
  }

  async currentAccess(user) {
    try {
      const access = await this.getByRole(user.role);
      return { success: true, access };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async create(params) {
    try {
      if (await this.rolemodel.findOne({ where: params })) {
        throw new BadRequestException(`Duplicate Role ${params.name}`);
      }
      const role = await this.rolemodel.save(params);
      await this.roleAccess.createDefaultRoles(role);
      return role.name;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findByName(name) {
    return await this.rolemodel.findOneBy({ name });
  }

  async findall() {
    return (await this.rolemodel.find()).map((obj) => {
      return obj.name;
    });
  }

  async getByRoleAccess() {
    const roles = await this.findall();
    const response = await Promise.all(
      roles.map(async (name) => ({
        [name]: await this.getByRole(name),
      })),
    );

    const access_response = {};
    response.forEach((role) => {
      const key = Object.keys(role)[0];
      access_response[key] = role[key];
    });

    return access_response;
  }

  async getByRole(role: string) {
    const _role = await this.rolemodel.findOne({ where: { name: role } });

    if (!_role) {
      throw new BadRequestException('invalid Role');
    }
    const access = await this.roleAccess.find(role);

    const response = {};

    access.forEach(({ features, module }) => {
      response[module] = features;
    });

    return response;
  }

  async createRoleAccess(params: RoleAccessDto) {
    try {
      const role = await this.findByName(params.role);

      if (!role) {
        throw new BadRequestException(`Invalid Role ${params.role}`);
      }

      return await this.roleAccess.update(params);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getRoleAccess(params: ValidateAccessDto) {
    const roleAccess = await this.roleAccess.roleAccessCheck(params);
    return roleAccess.features.includes(params.feature);
  }

  async resetRoleAccess() {
    const masterquerymanager = AppDataSource.isInitialized
      ? AppDataSource
      : await AppDataSource.initialize();
    const queryRunner = masterquerymanager.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.tenentRoleAccessModel.clear();

      // fetch the default role access with relationship of roles from master role access table
      const defaultRoleAccess = await queryRunner.manager
        .getRepository(MasterRoleAccess)
        .find({
          relations: ['role'],
        });

      // store the fetched role access in the tenent role access table
      await this.tenentRoleAccessModel.save(
        defaultRoleAccess.map((access) => ({
          role: { name: access.role.name },
          module: access.module,
          features: access.features,
        })),
      );
      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Role and role access reset successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error?.message || 'Failed to reset role access',
      );
    } finally {
      await queryRunner.release();
      await masterquerymanager.destroy();
    }
  }
}
