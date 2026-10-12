/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO for creating a new module
 */
export class CreateModuleDto {
  @ApiProperty({
    description: 'Name of the module',
    example: 'Financial Management',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the module',
    example: 'Module for managing financial aspects',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string;
}

/**
 * DTO for updating an existing module
 */
export class UpdateModuleDto {
  @ApiPropertyOptional({
    description: 'Name of the module',
    example: 'Financial Management',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the module',
    example: 'Module for managing financial aspects',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

/**
 * Type definition for sort parameter
 * Can be either a string (field name) or an object with field name and sort order
 */
export type SortParam = string | { [key: string]: unknown };

/**
 * DTO for filtering modules
 */
export class ModuleFilterDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: null,
    default: 1,
  })
  // @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: null,
    default: 10,
  })
  // @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  sort?: SortParam = 'createdAt';

  @ApiPropertyOptional({
    description: 'Search term for filtering modules',
    example: null,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by deleted status',
    example: null,
    default: false,
  })
  // @IsBoolean()
  @IsOptional()
  is_deleted?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filter by indicator ID',
    example: null,
  })
  @IsString()
  @IsOptional()
  indicatorId?: string;
}
