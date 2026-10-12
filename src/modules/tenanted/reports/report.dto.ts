import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReportTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  report_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  standard: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  datacube_id: string;
}

export class DownloadReportDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  report_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class StandardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  standard_id: string;
}
