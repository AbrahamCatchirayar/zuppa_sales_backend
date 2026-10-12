import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ChartType } from 'src/modules/base/dashboard/dashboard.dto';
import { Type } from 'src/modules/base/widgets/widget.dto';

export class CustomParameterDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sequence: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  questions: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  universal_questions: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  macro_function: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  unit: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  legends: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  label: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  custom_item_id: string;
}
export class CustomCombinedParameterDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sequence: number;

  @ApiProperty({ type: [CustomParameterDto] })
  @IsArray()
  @IsOptional()
  custom_parameters: CustomParameterDto[];
}

export class CustomItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ type: [CustomCombinedParameterDto] })
  @IsArray()
  @IsOptional()
  combined_parameters: CustomCombinedParameterDto[];
}

export class CustomTypeDto {
  @ApiProperty()
  @ApiProperty()
  @IsEnum(Type)
  @IsNotEmpty({ message: 'Type is required' })
  @IsNotEmpty({ message: 'Type is required' })
  type: Type;

  @ApiProperty()
  @IsEnum(ChartType)
  @ValidateIf((object) => object.type === Type.CHART)
  @IsNotEmpty({ message: 'Chart type is required when type is chart' })
  @IsEnum(ChartType, { message: 'Invalid chart type provided' })
  chart_type: ChartType;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_stacked: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_horizontal: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_metric: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_time_series: boolean;

  @ApiProperty({ type: [CustomItemDto] })
  @IsArray()
  @IsOptional()
  custom_items: CustomItemDto[];
}

export class CustomParameterUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  questions: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  universal_questions: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  macro_function: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  unit: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  legends: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  label: string[];
}

export class CustomCombinedParameterUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiProperty({ type: [CustomParameterUpdateDto] })
  @IsArray()
  @IsOptional()
  custom_parameters: CustomParameterUpdateDto[];
}

export class CustomItemUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ type: [CustomCombinedParameterUpdateDto] })
  @IsArray()
  @IsOptional()
  combined_parameters: CustomCombinedParameterUpdateDto[];
}

export class CustomTypeUpdateDto {
  @ApiProperty()
  @IsEnum(Type)
  @IsNotEmpty({ message: 'Type is required' })
  @IsOptional()
  type: Type;

  @ApiProperty()
  @IsEnum(ChartType)
  @ValidateIf((object) => object.type === Type.CHART)
  @IsNotEmpty({ message: 'Chart type is required when type is chart' })
  @IsEnum(ChartType, { message: 'Invalid chart type provided' })
  chart_type: ChartType;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_stacked: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_horizontal: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_metric: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_time_series: boolean;

  @ApiProperty({ type: [CustomItemUpdateDto] })
  @IsArray()
  @IsOptional()
  custom_items: CustomItemUpdateDto[];
}

export class CustomChartFilterDto {
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
}
