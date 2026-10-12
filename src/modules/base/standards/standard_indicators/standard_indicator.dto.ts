import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class IndicatorsRemove {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  id: string[];
}

export class StandardIndicatorFiltersDto {
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  masterIndicatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_deleted?: boolean;
}
