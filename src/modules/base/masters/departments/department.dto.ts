import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'The name of the department',
    example: 'Department of Health',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class DepartmentFilterParams {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit?: string = '10';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page = '1';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: 'createdAt';

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  filter?: {
    search?: string;
    is_deleted?: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  is_deleted?: boolean;
}
