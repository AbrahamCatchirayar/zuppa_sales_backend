/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SiteDto {
  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString({ each: true })
  name: string;

  @ApiPropertyOptional()
  @IsString({ each: true })
  location: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  business_unit: string;
}

export class UpdateSiteDto {
  @ApiPropertyOptional()
  @IsOptional()
  business_unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  location?: string;
}

export class FilterSiteDto {
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  skip?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  location?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  business_unit?: string[];
}
