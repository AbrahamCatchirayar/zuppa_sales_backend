import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DatacubeFrequencyenum } from './datacube.entity';

export class StandardDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  is_deleted?: boolean;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  logo_url: string;

  @ApiPropertyOptional()
  is_active?: boolean;
}

export class DatacubeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DatacubeFrequencyenum })
  @IsEnum(DatacubeFrequencyenum)
  @IsNotEmpty()
  frequency: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  financial_year: string;

  @ApiProperty({ type: [StandardDto] })
  @IsArray()
  @ValidateNested({ each: false })
  @Type(() => StandardDto)
  standards: StandardDto[];
}

export class UpdateDataCubeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: DatacubeFrequencyenum })
  @IsEnum(DatacubeFrequencyenum)
  @IsOptional()
  frequency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  financial_year: string;

  @ApiPropertyOptional({ type: [StandardDto] })
  @IsArray()
  @ValidateNested({ each: false })
  @Type(() => StandardDto)
  standards: StandardDto[];
}

export class DatacubeFiltersDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  site_name?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  task_status?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // is_deleted?: boolean;
}

export class StandardQueryDTO {
  @ApiProperty()
  @IsString()
  standard_ids: string;
}

export class configDto {
  // @ApiPropertyOptional({
  //   description: 'Datacube frequency id',
  // })
  // @IsString()
  // @IsOptional()
  // datacube_config_id?: string;

  @ApiProperty({
    description: 'Start date of the datacube frequency',
    example: '2025-05-15',
  })
  @IsString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'End date of the datacube frequency',
    example: '2025-05-30',
  })
  @IsString()
  @IsNotEmpty()
  end_date: string;
}
