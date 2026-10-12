/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { TenentFeatures, TenentModules } from 'src/utils';

export class CreateRoleDTO {
  @ApiProperty()
  // @IsEnum(TENENT_ROLE, { message: 'Invalid role list' })
  @IsString()
  role: string;
}
export class ValidateAccessDto {
  @IsString()
  @ApiProperty()
  role: string;

  @IsString()
  @ApiProperty()
  @IsEnum(TenentModules)
  module: string;

  @IsString()
  @ApiProperty()
  feature: string;
}

export class RoleAccessDto {
  @IsString()
  @ApiProperty()
  role: string;

  @ApiProperty()
  @IsEnum(TenentModules, { message: 'Invalid module list' })
  module: string;

  @ApiProperty()
  @IsEnum(TenentFeatures, { each: true, message: 'Invalid feature list' })
  features: TenentFeatures[];
}
