/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbol';
import { TenentModules } from 'src/utils';
import { DataSource } from 'typeorm';
import { RoleAccess } from './role-access.entity';
import { RoleAccessDto, ValidateAccessDto } from './role.dto';

@Injectable()
export class RoleAccessService implements OnModuleDestroy {
  private readonly roleAccessModle;

  private readonly connection: DataSource;

  constructor(@Inject(CONNECTION) connection: DataSource) {
    this.roleAccessModle = connection.getRepository(RoleAccess);
    this.connection = connection;
  }

  async onModuleDestroy() {
    try {
      await this.connection.destroy();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createDefaultRoles(role) {
    const role_access = [];
    TenentModules.forEach((values) => {
      role_access.push({
        role,
        module: values,
      });
    });
    return await this.roleAccessModle.save(role_access);
  }

  async update(params: RoleAccessDto) {
    const roleAcess = await this.roleAccessModle.findOne({
      where: { role: { name: params.role }, module: params.module },
    });

    if (!roleAcess) {
      throw new BadRequestException(
        `Invalid Module ${params.module} or Role ${params.role}`,
      );
    }

    const update = await this.roleAccessModle.save({
      id: roleAcess.id,
      features: params.features,
    });
    return update;
  }

  async roleAccessCheck(filter: ValidateAccessDto) {
    return await this.roleAccessModle.findOne({
      where: { role: filter.role, module: filter.module },
      select: ['features'],
    });
  }

  async find(role) {
    return await this.roleAccessModle.find({
      where: { role: { name: role } },
      select: ['features', 'module'],
    });
  }
}
