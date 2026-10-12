/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIndicatorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module_id: string;
}

export class IndicatorFilter {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_deleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  module?: string;
}

export class IndicatorUpdateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  module_id: string;
}
