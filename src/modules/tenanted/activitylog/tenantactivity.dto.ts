import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from 'src/utils';

export class ActivityFiltersDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sort: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'can search with activity_type, datacube.name, user.name',
    default: '',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter activities by creation date (ISO 8601 format)',
    example: '2025-12-01',
  })
  @IsDateString()
  @IsOptional()
  created_date?: string;
}
