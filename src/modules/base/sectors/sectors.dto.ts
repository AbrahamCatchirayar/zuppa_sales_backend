import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class SectorDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  sector_name: string;

  @ApiPropertyOptional()
  @IsArray()
  industries?: string[];
}

export class SectorFilter {
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

export class ActivateSectorDto {
  @ApiPropertyOptional()
  @IsNotEmpty()
  is_deleted?: boolean;
}
