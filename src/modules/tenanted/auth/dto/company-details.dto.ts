import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class CompanyDetailsDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  account_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  official_email_id: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsOptional()
  company_website_url: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone_number?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tax_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  sectors: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  industries: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  time_frame: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  standards: string[];
}
