import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CustomDashboardTypeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  widget_type_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dashboard_type_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  custom_type_id: string;
}

export class CustomDashboardColumnDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sequence: number;

  @ApiProperty({ type: [CustomDashboardTypeDto] })
  @IsArray()
  @IsNotEmpty()
  types: CustomDashboardTypeDto[];
}

export class CustomDashboardBlockDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  number_of_columns: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sequence: number;

  @ApiProperty({ type: [CustomDashboardColumnDto] })
  @IsArray()
  @IsNotEmpty()
  columns: CustomDashboardColumnDto[];
}

export class CustomDashboardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  number_of_blocks: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sequence: number;

  @ApiProperty({ type: [CustomDashboardBlockDto] })
  @IsArray()
  @IsNotEmpty()
  blocks: CustomDashboardBlockDto[];
}

export class CustomDashboardTypeUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  widget_type_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dashboard_type_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  custom_type_id: string;
}
export class CustomDashboardColumnUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  custom_dashboard_block_id: string;

  @ApiPropertyOptional({ type: [CustomDashboardTypeUpdateDto] })
  @IsArray()
  @IsOptional()
  types: CustomDashboardTypeUpdateDto[];
}
export class CustomDashboardBlockUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  number_of_columns: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiPropertyOptional({ type: [CustomDashboardColumnUpdateDto] })
  @IsArray()
  @IsOptional()
  columns: CustomDashboardColumnUpdateDto[];
}
export class CustomDashboardUpdateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ type: [CustomDashboardBlockUpdateDto] })
  @IsArray()
  @IsOptional()
  blocks: CustomDashboardBlockUpdateDto[];
}

export class CustomDashboardFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
