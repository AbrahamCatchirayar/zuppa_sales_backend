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
