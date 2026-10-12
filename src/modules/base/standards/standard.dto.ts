/* eslint-disable max-classes-per-file */
/* eslint-disable no-shadow */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum StandardSequenceType {
  MODULE = 'MODULE',
  INDICATOR = 'INDICATOR',
  QUESTION_SEQUENCE = 'QUESTION_SEQUENCE',
}

export class StandardDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  modules: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  indicators: string[];
}

export class AddIndicatorDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  indicator_id: string[];
}

export class AddQuestionDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  question_id: string[];
}

export class AddModuleDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  module_id: string[];
}

export class AddQuestionsDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  module_ids: string[];

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  indicator_ids: string[];

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  question_ids: string[];
}

export class StandardFilter {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  is_deleted?: boolean;
}

export class UpdateStandardDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  // @ApiPropertyOptional()
  // @IsArray()
  // @IsOptional()
  // modules: string[];

  // @ApiPropertyOptional()
  // @IsArray()
  // @IsOptional()
  // indicators: string[];
}

export class SequenceItemDto {
  @ApiProperty({
    example: 'uuid1',
    description: 'ID of the module or indicator',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 1, description: 'New sequence number' })
  @IsNumber()
  @IsNotEmpty()
  sequence: number;
}

export class UpdateSequenceDto {
  @ApiProperty({
    type: [SequenceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceItemDto)
  @ArrayNotEmpty()
  items: SequenceItemDto[];
}

// export class AddModulesIndicatorsQuestionsToStandardDto {
//   @ApiProperty()
//   @IsObject()
//   data: {
//     module: {
//       id: string;
//       indicator: {
//         id: string;
//         question: string[];
//       }[];
//     }[];
//   };
// }

export class IndicatorDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [String] })
  question: string[];
}

export class ModuleDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [IndicatorDto] })
  indicator: IndicatorDto[];
}

export class DataDto {
  @ApiProperty({ type: [ModuleDto] })
  module: ModuleDto[];
}

export class AddModulesIndicatorsQuestionsToStandardDto {
  @ApiProperty({ type: DataDto })
  @ValidateNested()
  @Type(() => DataDto)
  data: DataDto;
}

// new dto for link_modules

export class QuestionDto_opt {
  @IsString()
  id: string;

  @IsBoolean()
  checked: boolean;
}

export class IndicatorDto_opt {
  @IsString()
  id: string;

  @IsBoolean()
  checked: boolean;

  @ValidateNested({ each: true })
  @Type(() => QuestionDto_opt)
  question: QuestionDto_opt[];
}

export class ModuleDto_opt {
  @IsString()
  id: string;

  @IsBoolean()
  checked: boolean;

  sequence: number;

  @ValidateNested({ each: true })
  @Type(() => IndicatorDto_opt)
  indicator: IndicatorDto_opt[];
}

// Wrapper for "data"
export class AddModulesIndicatorsQuestionsToStandardDataDto {
  @ValidateNested({ each: true })
  @Type(() => ModuleDto_opt)
  module: ModuleDto_opt[];
}

export class AddModulesIndicatorsQuestionsToStandardDto_opt {
  @ValidateNested()
  @Type(() => AddModulesIndicatorsQuestionsToStandardDataDto)
  data: AddModulesIndicatorsQuestionsToStandardDataDto;
}

// new dto for Link modules

export class QuestionSequenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sequence_id: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_removed: boolean;
}

export class UpdateAddRemoveQuestionSequenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  indicator_id: string;

  @ApiProperty({
    type: [QuestionSequenceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionSequenceDto)
  @ArrayNotEmpty()
  question_sequences: QuestionSequenceDto[];
}

export class QuestionRulesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parent_question_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parent_question_option_id: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_removed: boolean;
}

export class UpdateQuestionRulesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  indicator_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiProperty({
    type: [QuestionRulesDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionRulesDto)
  @ArrayNotEmpty()
  rules: QuestionRulesDto[];
}

export class GroupQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question_option_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sequence_id: string;
}

export class AddGroupQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  indicator_id: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_multiple: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  max_limit?: number = 0;

  @ApiProperty()
  @IsArray()
  rule: [];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => GroupQuestionDto)
  group_questions: GroupQuestionDto[];
}

export class CreateModuleForStandardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module_id: string;

  @ApiProperty({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  is_removed: boolean;
}

export class CreateIndicatorForStandardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  indicator_id: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsNotEmpty()
  is_removed: boolean;
}

export class CreateStandardQuestionsDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  questionId: string[];
}
