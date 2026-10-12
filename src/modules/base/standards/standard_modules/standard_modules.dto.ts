/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateStandardModuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  standard_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  master_module_id: string;
}

export class StandardModuleFiltersDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  masterModuleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_deleted?: boolean;
}

export class ModulesRemove {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  id: string[];
}
