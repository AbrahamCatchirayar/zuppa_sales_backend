import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StandardTemplateQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question_title: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  standard_question: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  macro_function: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  unit_value: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  emission_value: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_previous_year: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_prior_year: boolean;
}

export class StandardTemplateDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  standard_id: string;

  @ApiProperty({ type: [StandardTemplateQuestionDto] })
  @IsArray()
  @IsNotEmpty({ each: true })
  @ValidateNested({ each: true })
  @Type(() => StandardTemplateQuestionDto)
  standard_template_question: StandardTemplateQuestionDto[];
}

export class StandardTemplateFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  page: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  limit: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  order: string;
}
