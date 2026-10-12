/* eslint-disable max-classes-per-file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  MinLength,
  MaxLength,
  IsUUID,
  ArrayNotEmpty,
  ValidateIf,
  IsBoolean,
  IsNumber,
  Matches,
} from 'class-validator';
import { QuestionType } from 'src/enum/questiontype.enum';

export class OptionsDto {
  @ApiProperty({
    description: 'Unique identifier for the option',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({
    description: 'Text for the option',
    example: 'Option 1',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    description: 'Value for the option',
    example: 'option_1',
  })
  @IsString()
  @IsOptional()
  value?: string;
}

export class MixedTypeQuestionDto {
  @ApiProperty({
    enum: QuestionType,
    enumName: 'QuestionType',
    example: QuestionType.TEXT,
  })
  @IsEnum(QuestionType, {
    message: `Type must be an of: ${Object.values(QuestionType).join(', ')}`,
  })
  @IsNotEmpty()
  value_question_type: QuestionType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value_name: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  // @ArrayNotEmpty()
  @ValidateIf(
    (question) =>
      question.value_question_type === QuestionType.SINGLE_SELECT ||
      question.value_question_type === QuestionType.MULTI_SELECT,
  )
  @IsString({ each: true })
  value_enum: string[];

  @ApiProperty({
    enum: QuestionType,
    enumName: 'QuestionType',
    example: QuestionType.TEXT,
  })
  @IsEnum(QuestionType, {
    message: `Type must be an of: ${Object.values(QuestionType).join(', ')}`,
  })
  @IsNotEmpty()
  unit_type: QuestionType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit_name: string;

  @ApiPropertyOptional({
    type: [MixedTypeQuestionDto],
    description: 'Array of unit enum values',
    example: ['kg', 'l', 'ml'],
  })
  @IsArray()
  @IsOptional()
  // @ArrayNotEmpty()
  @ValidateIf(
    (question) =>
      question.unit_type === QuestionType.SINGLE_SELECT ||
      question.unit_type === QuestionType.MULTI_SELECT,
  )
  @IsString({ each: true })
  unit_enum: string[];
}

export class UpdateMixedTypeQuestionDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({
    enum: QuestionType,
    enumName: 'QuestionType',
    example: QuestionType.TEXT,
  })
  @IsEnum(QuestionType, {
    message: `Type must be an of: ${Object.values(QuestionType).join(', ')}`,
  })
  @IsOptional()
  question_type: QuestionType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  value_name: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @ValidateIf(
    (question) =>
      question.value_question_type === QuestionType.SINGLE_SELECT ||
      question.value_question_type === QuestionType.MULTI_SELECT,
  )
  @IsString({ each: true })
  value_enum: string[];

  @ApiProperty({
    enum: QuestionType,
    enumName: 'QuestionType',
    example: QuestionType.TEXT,
  })
  @IsEnum(QuestionType, {
    message: `Type must be an of: ${Object.values(QuestionType).join(', ')}`,
  })
  @IsOptional()
  unit_type: QuestionType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  unit_name: string;

  @ApiProperty({
    type: [MixedTypeQuestionDto],
    description: 'Array of unit enum values',
    example: ['kg', 'l', 'ml'],
  })
  @IsArray()
  @IsOptional()
  @ValidateIf(
    (question) =>
      question.unit_type === QuestionType.SINGLE_SELECT ||
      question.unit_type === QuestionType.MULTI_SELECT,
  )
  @IsString({ each: true })
  unit_enum: string[];
}

export class CreateQuestionDto {
  @ApiProperty({
    description: 'Indicator ID of the question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  indicator_id: string;

  @ApiPropertyOptional({
    description: 'Universal Question ID of the question',
    example: 'UID_1',
  })
  @IsString()
  @Matches(/^UID_\d+$/, {
    message:
      'Universal question ID must start with UID_ followed by numbers (e.g., UID_1, UID_2, UID_3)',
  })
  @IsNotEmpty()
  universal_question_id?: string;

  @ApiPropertyOptional({
    description: 'Sub-Indicator ID of the question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  subindicator_id?: string;

  @ApiProperty({
    description: 'Department ID of the question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  department_id: string;

  @ApiProperty({
    description: 'Title of the question',
    example: 'What is your favorite programming language?',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(600)
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the question',
    example:
      'Please select your primary programming language from the options below',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    enum: QuestionType,
    enumName: 'QuestionType',
    description: 'Type of the question',
    example: QuestionType.SINGLE_SELECT,
  })
  @IsEnum(QuestionType, {
    message: `Type must be one of: ${Object.values(QuestionType).join(', ')}`,
  })
  @IsNotEmpty()
  question_type: QuestionType;

  @ApiPropertyOptional({
    description: 'Placeholder text for the question input',
    example: 'Select an option...',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  place_holder: string;

  @ApiPropertyOptional({
    type: [OptionsDto],
    description: 'List of options for select type questions',
    example: [
      { text: 'JavaScript', value: 'javascript' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OptionsDto)
  options: OptionsDto[];

  @ApiPropertyOptional({
    description: 'add value name and unit lists for select unit value',
  })
  @IsOptional()
  mixed_type_question: MixedTypeQuestionDto;

  @ApiPropertyOptional({
    description: 'Whether the question is the latest data',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_latest_data: boolean;
}

export class MasterQuestionFilter {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: null,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: null,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: null,
    default: 'createdAt',
  })
  @IsOptional()
  sort?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Search term to filter questions',
    example: null,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by indicator ID',
    example: null,
  })
  @IsUUID()
  @IsOptional()
  indicator_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by module ID',
    example: null,
  })
  @IsUUID()
  @IsOptional()
  module_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by deletion status',
    example: null,
    default: false,
  })
  @IsOptional()
  is_deleted?: boolean;

  @ApiPropertyOptional({
    enum: QuestionType,
    enumName: 'QuestionType',
    description: 'Filter by question type',
    example: null,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  question_type?: QuestionType;
}

export class UpdateQuestionDto {
  @ApiPropertyOptional({
    description: 'Indicator ID of the question',
    example: null,
  })
  @IsUUID()
  @IsOptional()
  indicator_id?: string;

  @ApiPropertyOptional({
    description: 'Universal Question ID of the question',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  universal_question_id?: string;

  @ApiPropertyOptional({
    description: 'Sub-Indicator ID of the question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  subindicator_id?: string;

  @ApiPropertyOptional({
    description: 'Department ID of the question',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  department_id?: string;

  @ApiPropertyOptional({
    description: 'Updated title of the question',
    example: 'What is your preferred programming language?',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(600)
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    description: 'Updated description of the question',
    example:
      'Please select your preferred programming language from the options below',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  // @MinLength(10)
  // @MaxLength(1000)
  @IsOptional()
  description: string;

  @ApiProperty({
    enum: QuestionType,
    enumName: 'QuestionType',
    description: 'Updated type of the question',
    example: QuestionType.SINGLE_SELECT,
  })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  question_type: QuestionType;

  @ApiPropertyOptional({
    description: 'Updated placeholder text',
    example: 'Choose an option...',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  place_holder: string;

  @ApiPropertyOptional({
    type: [OptionsDto],
    description: 'Updated list of options',
    example: [
      { text: 'JavaScript', value: 'javascript' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
      { text: 'C++', value: 'c++' },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OptionsDto)
  options: OptionsDto[];

  @ApiPropertyOptional({
    description: 'add value name and unit lists for select unit value',
  })
  @IsOptional()
  mixed_type_question: UpdateMixedTypeQuestionDto;

  @ApiPropertyOptional({
    description: 'Whether the question is the latest data',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_latest_data: boolean;
}

export class QuestionOptionsDeleteDto {
  @ApiProperty({
    description: 'List of option IDs to delete',
    type: [String],
    example: ['a12f3e4c-567b-890d-1234-56789abcdef0'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  optionIds: string[];

  @ApiProperty({
    description: 'Soft delete flag (true = delete, false = restore)',
    example: true,
  })
  @IsBoolean()
  isDeleted: boolean;
}
