/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AdminFeatures, AdminModules } from 'src/utils';

export class CreateAdminRoleDto {
  @ApiProperty({ default: 'ADMIN' })
  @IsString()
  name: string;
}

export class CreateAdminRoleAccessDto {
  @IsString()
  @ApiProperty()
  role: string;

  @IsString()
  @ApiProperty()
  @IsEnum(AdminModules)
  module: string;

  @IsEnum(AdminFeatures, { each: true, message: 'Invalid feature list' })
  @ApiProperty()
  features: AdminFeatures[];
}
