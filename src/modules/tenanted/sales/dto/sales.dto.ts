import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Brand' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'brand' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'The manufacturing brand or series' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Core Platform (Core)' })
  @IsOptional()
  @IsString()
  parentBranch?: string;
}

export class CreateOptionCodeDto {
  @ApiProperty({ example: 'EZFly' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'EZF' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class CreateConfiguredProductDto {
  @ApiProperty({ example: 'ZUP-EZF-HWK-R0-55' })
  @IsNotEmpty()
  @IsString()
  productCode: string;

  @ApiProperty({ example: 'R0' })
  @IsNotEmpty()
  @IsString()
  revisionNumber: string;

  @ApiPropertyOptional({ example: '2026-10-14' })
  @IsOptional()
  @IsString()
  revisionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ example: 'PUBLISHED' })
  @IsOptional()
  @IsString()
  status?: string;
}
