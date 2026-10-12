import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  ArrayNotEmpty,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsBoolean,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class QuestionsRemove {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  id: string[];
}

export class QuestionRules {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parent_question_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parent_question_option_id: string;
}
export class CreateQuestionRulesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question_sequence_id: string;

  @ApiProperty({ type: [QuestionRules] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionRules)
  rules: QuestionRules[];
}

export class QuestionOptionDependency {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question_option_id: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  dependent_question_ids: string[];
}

export class GroupQuestionRules {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parent_question_id: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // parent_question_option_id: string;

  @ApiProperty({ type: [QuestionOptionDependency] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDependency)
  parent_question_options: QuestionOptionDependency[];

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // dependent_question_id: string;

  // @ApiProperty()
  // @IsArray()
  // @IsNotEmpty()
  // dependent_question_ids: string[];
}

export class GroupQuestionsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  max_limit: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  standard_question_ids: string[];

  @ApiPropertyOptional({ type: [GroupQuestionRules] })
  @IsOptional()
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => GroupQuestionRules)
  rules?: GroupQuestionRules[];
}

export class RemoveQuestionRulesDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  question_rules_ids: string[];
}
