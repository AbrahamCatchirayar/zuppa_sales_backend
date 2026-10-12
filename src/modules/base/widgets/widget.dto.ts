import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  validate,
  ValidateIf,
} from 'class-validator';

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  RADAR = 'radar',
  POLAR_AREA = 'polarArea',
  BUBBLE = 'bubble',
  SCATTER = 'scatter',
  BOX_PLOT = 'boxPlot',
  POLAR_LINE = 'polarLine',
  RADIAL_LINE = 'radialLine',
  TREEMAP = 'treemap',
  CHOROPLETH = 'choropleth',
  GEO_MAP = 'geoMap',
  AREA = 'area',
  HISTOGRAM = 'histogram',
  DONUT = 'donut',
  RADIAL_BAR = 'radialBar',
  HEATMAP = 'heatmap',
  CANDLESTICK = 'candlestick',
  RANGE_BAR = 'rangeBar',
}

export enum Type {
  CARD = 'card',
  CHART = 'chart',
  TABLE = 'table',
  TEXT_AREA = 'textArea',
}

export class CustomParameterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  questions: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  universal_questions: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  macro_function: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  legends: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  label: string[];
}

export class CombinedParameterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [CustomParameterDto] })
  @IsOptional()
  @IsArray()
  custom_parameters: CustomParameterDto[];
}

export class WidgetFilterUpdateDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  public_question_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  universal_question_id: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_option: boolean;

  @ApiPropertyOptional({
    description: 'Widget Filter Sequence',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  sequence: number;
}

export class WidgetItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  filter: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isHomePageWidget: boolean;

  @ApiProperty({ type: [CombinedParameterDto] })
  @IsOptional()
  @IsArray()
  combined_parameters: CombinedParameterDto[];

  @ApiProperty({ type: [WidgetFilterUpdateDto] })
  @IsOptional()
  @IsArray()
  filters: WidgetFilterUpdateDto[];
}

export class WidgetColumnDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Type)
  widget_type: Type;

  @ApiProperty()
  @IsString()
  @IsEnum(ChartType)
  @ValidateIf((object) => object.widget_type === Type.CHART)
  @IsNotEmpty({ message: 'Chart type is required when widget type is chart' })
  @IsEnum(ChartType, { message: 'Invalid chart type provided' })
  chart_type: ChartType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isStacked: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isHorizontal: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isMetric: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isTimeSeries: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  latestData: boolean;

  @ApiProperty({ type: [WidgetItemDto] })
  @IsNotEmpty()
  @IsArray()
  widget_items: WidgetItemDto[];
}

export class WidgetBlockDto {
  @ApiProperty({ type: [WidgetColumnDto] })
  @IsArray()
  @IsNotEmpty()
  number_of_columns: WidgetColumnDto[];
}

export class BasicWidgetDto {
  @ApiPropertyOptional()
  @IsOptional()
  department_id: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sequence: number;

  @ApiProperty({ type: [WidgetBlockDto] })
  @IsArray()
  @IsNotEmpty()
  number_of_blocks: WidgetBlockDto[];
}

export class WidgetDto {
  @ApiProperty({ type: [BasicWidgetDto] })
  @IsArray()
  @IsNotEmpty()
  widgets: BasicWidgetDto[];
}

export class WidgetTypeDto {
  @ApiProperty({ enum: Type })
  @IsString()
  @IsNotEmpty()
  @IsEnum(Type)
  type: string;

  @ApiProperty({ enum: ChartType })
  @IsString()
  @IsOptional()
  @IsEnum(ChartType)
  @ValidateIf((object, value) => object.type === 'chart')
  chart_type: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isStacked: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isHorizontal: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isMetric: boolean;
}

export class WidgetTypeFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  chart_type: string;
}

export class WidgetFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  page = '1';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  limit = '10';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  order: string;
}

export class CustomParameterUpdateDto {
  @ApiProperty({
    description: 'Custom Parameter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  // @IsUUID()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    description: 'Custom Parameter Name',
    example: 'Parameter Name',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: 'Custom Parameter Sequence',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiPropertyOptional({
    description: 'List of question IDs',
    type: [String],
    example: ['question1', 'question2'],
  })
  @IsOptional()
  @IsArray()
  question_list: string[];

  @ApiPropertyOptional({
    description: 'Macro function for the parameter',
    example: 'SUM',
  })
  @IsOptional()
  @IsString()
  macro_function: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'kg',
  })
  @IsOptional()
  @IsString()
  unit: string;

  @ApiPropertyOptional({
    description: 'Legend labels',
    type: [String],
    example: ['Label1', 'Label2'],
  })
  @IsOptional()
  @IsArray()
  legends: string[];

  @ApiPropertyOptional({
    description: 'Display labels',
    type: [String],
    example: ['Display1', 'Display2'],
  })
  @IsOptional()
  @IsArray()
  label: string[];
}

export class CombinedParameterUpdateDto {
  @ApiProperty({
    description: 'Combined Parameter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  // @IsUUID()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    description: 'Combined Parameter Name',
    example: 'Combined Param',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({
    description: 'Custom parameters in this combined parameter',
    type: [CustomParameterUpdateDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  custom_parameters: CustomParameterUpdateDto[];
}
export class WidgetItemUpdateDto {
  @ApiProperty({
    description: 'Widget Item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  // @IsUUID()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    description: 'Widget Item Title',
    example: 'Item Title',
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    description: 'Widget Item Filter',
    example: 'true',
  })
  @IsBoolean()
  @IsOptional()
  filter: boolean;

  @ApiPropertyOptional({
    description: 'Widget filters',
    type: [WidgetFilterUpdateDto],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  filters: WidgetFilterUpdateDto[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isHomePageWidget: boolean;

  @ApiPropertyOptional({
    description: 'Combined parameters for this widget item',
    type: [CombinedParameterUpdateDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  combined_parameters: CombinedParameterUpdateDto[];
}

export class WidgetColumnUpdateDto {
  @ApiProperty({
    description: 'Widget Column ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    description: 'Widget Type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  type_id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  widget_type: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  chart_type: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isStacked: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isHorizontal: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isMetric: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isTimeSeries: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  latestData: boolean;

  @ApiPropertyOptional({
    description: 'The sequence of the widget column',
  })
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiProperty({
    description: 'Widget Type in this column',
    type: WidgetItemUpdateDto,
    isArray: true,
  })
  @IsOptional()
  widget_items: [WidgetItemUpdateDto]; // Changed from array to single object
}

export class WidgetBlockUpdateDto {
  @ApiProperty({
    description: 'The id of the widget block',
  })
  // @IsUUID()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({ type: [WidgetColumnDto] })
  @IsArray()
  @IsOptional()
  @IsArray()
  number_of_columns: WidgetColumnUpdateDto[];

  @ApiPropertyOptional({
    description: 'The sequence of the widget block',
  })
  @IsNumber()
  @IsOptional()
  sequence: number;
}

export class WidgetUpdateDto {
  @ApiPropertyOptional({
    description: 'The sequence of the widget',
  })
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiPropertyOptional({ type: [WidgetBlockUpdateDto] })
  @IsOptional()
  @IsArray()
  number_of_blocks: WidgetBlockUpdateDto[];

  @ApiPropertyOptional()
  // @IsUUID()
  @IsOptional()
  department_id: string;
}
