/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TenentFeatures, TenentModules } from 'src/utils';

export class FilterQuery {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'The status of the account',
    enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCK', 'SUSPEND', 'DELETED'],
    enumName: 'account_status',
  })
  @IsString()
  @IsEnum(['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCK', 'SUSPEND', 'DELETED'], {
    message: 'Status must be one of the specified values',
  })
  @IsOptional()
  status?: ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCK', 'SUSPEND', 'DELETED'];
}

export class ReasonDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class InviteAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  account_name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  phone_number: string;
}

export class UpdateRoleAccessDto {
  @ApiProperty()
  @IsEnum(TenentModules, { message: 'Invalid module list' })
  module: string;

  @ApiProperty()
  @IsEnum(TenentFeatures, { each: true, message: 'Invalid feature list' })
  features: TenentFeatures[];
}
