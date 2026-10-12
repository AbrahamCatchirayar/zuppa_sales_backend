/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BasicBusinessUnitDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  @IsObject({ each: true })
  sites?: { name: string; location: string }[];

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  account: string;
}

export class BusinessUnit extends BasicBusinessUnitDto {
  @ApiProperty({ type: () => [BasicBusinessUnitDto] })
  @IsArray()
  @Type(() => BasicBusinessUnitDto)
  @ValidateNested({ each: true })
  businessUnits: BasicBusinessUnitDto[];
}
export class UpdateBusinessUnitDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  sites?: {
    id: string;
    name?: string;
    location?: string;
  }[];
  // @ApiPropertyOptional()
  // @IsString()
  // @IsOptional()
  // name: string;

  // @ApiPropertyOptional()
  // @IsArray()
  // @IsOptional()
  // sites: string[];
}

export class FilterBusinessUnitDto {
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
  name?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  sites: string[];
}
