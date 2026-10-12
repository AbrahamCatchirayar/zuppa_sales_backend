import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

export class DashboardFiltersDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  public_question_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  universal_question_id: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_option: boolean;
}

export class DashboardItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  filter: boolean;

  @ApiProperty({ type: [DashboardFiltersDto] })
  @IsOptional()
  @IsArray()
  filters: DashboardFiltersDto[];

  @ApiProperty({ type: [CombinedParameterDto] })
  @IsOptional()
  @IsArray()
  combined_parameters: CombinedParameterDto[];
}

export class DashboardColumnDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Type)
  dashboard_type: Type;

  @ApiProperty()
  @IsString()
  @IsEnum(ChartType)
  @ValidateIf((object) => object.dashboard_type === Type.CHART)
  @IsNotEmpty({
    message: 'Chart type is required when dashboard type is chart',
  })
  @IsEnum(ChartType, { message: 'Invalid chart type provided' })
  chart_type: ChartType;

  @ApiProperty()
  @IsBoolean()
  isStacked: boolean;

  @ApiProperty()
  @IsBoolean()
  isHorizontal: boolean;

  @ApiProperty()
  @IsBoolean()
  isMetric: boolean;

  @ApiProperty()
  @IsBoolean()
  isTimeSeries: boolean;

  @ApiProperty()
  @IsBoolean()
  latestData: boolean;

  @ApiProperty({ type: [DashboardItemDto] })
  @IsNotEmpty()
  @IsArray()
  dashboard_items: DashboardItemDto[];
}

export class DashboardBlockDto {
  @ApiProperty({ type: [DashboardColumnDto] })
  @IsArray()
  @IsNotEmpty()
  number_of_columns: DashboardColumnDto[];
}

export class DashboardTabDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  number_of_tabs: number;

  @ApiProperty({ type: [DashboardBlockDto] })
  @IsArray()
  @IsNotEmpty()
  number_of_blocks: DashboardBlockDto[];
}

// export class BasicDashboardDto {
//   @ApiProperty()
//   @IsString()
//   @IsOptional()
//   name: string;

//   @ApiProperty()
//   @IsUUID()
//   department_id: string;

//   @ApiProperty()
//   @IsNumber()
//   @IsNotEmpty()
//   sequence: number;

//   @ApiProperty({ type: [DashboardTabDto] })
//   @IsArray()
//   @IsNotEmpty()
//   tabs: DashboardTabDto[];
// }

// export class DashboardDto {
//   @ApiProperty({ type: [BasicDashboardDto] })
//   @IsArray()
//   @IsNotEmpty()
//   dashboards: BasicDashboardDto[];
// }

export class BasicDashboardDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  department_id?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  standard_id?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sequence: number;

  @ApiProperty({ type: [DashboardTabDto] })
  @IsArray()
  @IsNotEmpty()
  tabs: DashboardTabDto[];
}

export class DashboardDto {
  @ApiProperty({ type: [BasicDashboardDto] })
  @IsArray()
  @IsNotEmpty()
  dashboards: BasicDashboardDto[];
}

export class DashboardFilterDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  page = '1';

  @ApiProperty()
  @IsString()
  @IsOptional()
  limit = '10';

  @ApiProperty()
  @IsString()
  @IsOptional()
  sort: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  order: string;
}

export class CustomParameterUpdateDto {
  @ApiProperty()
  @IsOptional()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  questions: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  macro_function: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  unit: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  legends: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  label: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sequence: number;
}

export class CombinedParameterUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ type: [CustomParameterUpdateDto] })
  @IsArray()
  @IsOptional()
  custom_parameters: CustomParameterUpdateDto[];
}

export class DashboardFilterUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: string;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sequence: number;
}

export class DashboardItemUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  filter: boolean;

  @ApiPropertyOptional({ type: [DashboardFilterUpdateDto] })
  @IsArray()
  @IsOptional()
  filters: DashboardFilterUpdateDto[];

  @ApiPropertyOptional({ type: [CombinedParameterUpdateDto] })
  @IsArray()
  @IsOptional()
  combined_parameters: CombinedParameterUpdateDto[];
}

export class DashboardColumnUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dashboard_type: Type;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum(ChartType)
  @ValidateIf((object) => object.dashboard_type === Type.CHART)
  @IsNotEmpty({
    message: 'Chart type is required when dashboard type is chart',
  })
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

  @ApiPropertyOptional({ type: [DashboardItemUpdateDto] })
  @IsArray()
  @IsOptional()
  dashboard_items: DashboardItemUpdateDto[];
}

export class DashboardBlockUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({ type: [DashboardColumnUpdateDto] })
  @IsArray()
  @IsOptional()
  number_of_columns: DashboardColumnUpdateDto[];
}

export class DashboardTabUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ type: [DashboardBlockUpdateDto] })
  @IsArray()
  @IsOptional()
  number_of_blocks: DashboardBlockUpdateDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sequence: number;
}

export class DashboardUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sequence: number;

  @ApiPropertyOptional({ type: [DashboardTabUpdateDto] })
  @IsArray()
  @IsOptional()
  tabs: DashboardTabUpdateDto[];
}
