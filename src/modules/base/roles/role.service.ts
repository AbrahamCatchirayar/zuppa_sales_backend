/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  AdminModules,
  default_roles_tenent_admin,
  default_tenent_role_access,
  get_admin_roles,
  get_tenent_roles,
} from 'src/utils';
import { Repository } from 'typeorm';
import { MasterRole } from './master_tenent_roles/tenent_role.entity';
import { MasterRoleAccess } from './master_tenent_roles/tenent_role_access.entity';
import { CreateAdminRoleAccessDto, CreateAdminRoleDto } from './role.dto';
import { AdminRole } from './role.entity';
import { AdminRoleAccess } from './role_access.entity';
import { RoleAccessService } from 'src/modules/tenanted/roles/role-access.service';
import { MasterAccount } from '../accounts/account.entity';
import { randomUUID } from 'crypto';

export class AdminRoleService {
  constructor(
    @InjectRepository(AdminRole)
    private readonly adminRoleModel: Repository<AdminRole>,
    @InjectRepository(AdminRoleAccess)
    private readonly adminRoleAccessModel: Repository<AdminRoleAccess>,
    @InjectRepository(MasterRole)
    private readonly tenentRoleModel: Repository<MasterRole>,
    @InjectRepository(MasterRoleAccess)
    private readonly tenentRoleAccessModel: Repository<MasterRoleAccess>,
    @InjectRepository(MasterAccount)
    private readonly masterAccountModel: Repository<MasterAccount>,

    @InjectDataSource()
    private readonly tenantRoleAccessService: RoleAccessService,
  ) {}

  async init() {
    await this.adminRoleModel.upsert(get_admin_roles(), ['name']);
    await this.adminRoleAccessModel.clear();
    await this.adminRoleAccessModel.save(default_roles_tenent_admin());
    await this.tenentRoleModel.upsert(get_tenent_roles(), ['name']);
    await this.tenantRoleAccessValidation();
  }

  async tenantRoleAccessValidation() {
    try {
      const tenantRoleAccess = default_tenent_role_access();

      // Get all existing role access entries in a single query
      const existingRoleAccess = await this.tenentRoleAccessModel.find({
        relations: ['role'],
        select: ['module', 'role'],
      });

      // Create a Set of existing role-module combinations for O(1) lookup
      const existingCombinations = new Set(
        existingRoleAccess.map((ra) => `${ra.role.name}-${ra.module}`),
      );

      // Filter out entries that already exist
      const newRoleAccess = tenantRoleAccess.filter(
        (role) => !existingCombinations.has(`${role.role.name}-${role.module}`),
      );

      // Save all new entries in bulk if there are any
      if (newRoleAccess.length > 0) {
        await this.tenentRoleAccessModel.save(newRoleAccess);
        const tenants = await this.masterAccountModel.find();

        for (const tenant of tenants) {
          if (!tenant.id) {
            console.warn(`[RoleSync] Tenant has no ID, skipping.`);
            continue;
          }
          const schemaName = `tenent_${tenant.id}`;

          for (const roleAccess of newRoleAccess) {
            try {
              const features = roleAccess.features || [];
              const roleName = roleAccess.role.name;
              const moduleName = roleAccess.module;

              await this.adminRoleModel.manager.query(
                `INSERT INTO "${schemaName}".role_access ("id", "created_at", "updated_at", "features", "module", "role") 
                 VALUES ($1, NOW(), NOW(), $2, $3, $4) 
                 ON CONFLICT ("role", "module") DO NOTHING`,
                [randomUUID(), features, moduleName, roleName],
              );
            } catch (error) {
              console.error(
                `[RoleSync] Failed to update role access for tenant ${tenant.slug} (Schema: ${schemaName}): ${error.message}`,
              );
            }
          }
        }
      }
    } catch (error) {
      throw new BadRequestException(error?.message || error);
    }
  }

  async createRole(body: CreateAdminRoleDto) {
    try {
      if (await this.adminRoleModel.findOneBy(body)) {
        throw new BadRequestException(`role already exist ${body.name}`);
      }
      const role = await this.adminRoleModel.save(body);
      const role_access = [];
      if (role) {
        AdminModules.forEach((values) => {
          role_access.push({
            role: role.name,
            module: values,
          });
        });

        await this.adminRoleAccessModel.save(role_access);
        return role.name;
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createRoleAccess(body: CreateAdminRoleAccessDto) {
    try {
      const roleaccess = await this.adminRoleAccessModel.findOne({
        where: { role: { name: body.role }, module: body.module },
      });
      if (!roleaccess) {
        throw new BadRequestException(
          `Invalid Module ${body.module} or Role ${body.role}`,
        );
      }

      const update = await this.adminRoleAccessModel.save({
        id: roleaccess.id,
        features: body.features,
      });

      return {
        success: true,
        role_access: update,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
