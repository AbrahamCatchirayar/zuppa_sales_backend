import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class IndicatorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  @IsNotEmpty()
  @IsObject({ each: true })
  questions: Record<string, any>[];
}

export class DisclosureDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  datacube_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  submitted_by: string;

  @ApiProperty({ type: [IndicatorDto] })
  @IsArray()
  @IsNotEmpty()
  @IsObject({ each: true })
  indicators: IndicatorDto[];
}

export class FilterDisclosureDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsString()
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
  @IsOptional()
  datacube_id?: string;
}

export class UpdateDisclosureDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsNotEmpty()
  datacube_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  submitted_by?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  indicators?: Record<string, any>[];
}
