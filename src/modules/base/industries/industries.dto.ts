import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class IndustryFilter {
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

  // @ApiPropertyOptional()
  // @IsBoolean()
  // @IsOptional()
  // is_active?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sector: string;

  @ApiPropertyOptional({
    description: 'The status of the account',
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    enumName: 'status',
  })
  @IsEnum(['ACTIVE', 'INACTIVE', 'PENDING'], {
    message: 'Status must be one of the specified values',
  })
  @IsOptional()
  status?: ['ACTIVE', 'INACTIVE', 'PENDING'];
}

export class IndustryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  industry_name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sector?: string;
}

export class UpdateIndustryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  industry_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sector?: string;
}
