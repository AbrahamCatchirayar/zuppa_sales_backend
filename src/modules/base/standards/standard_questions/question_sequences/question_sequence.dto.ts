/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { QuestableType } from 'src/enum/questiontype.enum';

export class QuestionSequenceRuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question_sequence_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dependent_question_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dependent_option_id: string;
}

export class QuestionSequenceDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  questionIds: string[];

  @ApiProperty({ enum: QuestableType })
  @IsString()
  @IsNotEmpty()
  question_type: QuestableType;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_dependent: boolean;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionSequenceRuleDto)
  rules: QuestionSequenceRuleDto[];
}

export class GroupRuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  standard_question_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dependent_question_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dependent_option_id: string;
}

export class GroupQuestionsDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_multiple: boolean;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  max_limit: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  standard_questions: string[];

  @ApiProperty({ type: [GroupRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupRuleDto)
  group_rule: GroupRuleDto[];
}

export class CreateQuestionSequenceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  questions: string;

  @ApiProperty({ enum: QuestableType, description: 'Type of the question' })
  @IsString()
  @IsNotEmpty()
  question_type: QuestableType;

  @ApiProperty({ description: 'Whether the question sequence is dependent' })
  @IsBoolean()
  @IsNotEmpty()
  dependent_to: boolean;

  @ApiProperty({
    type: [QuestionSequenceRuleDto],
    description: 'Array of question sequence rules',
    required: false,
  })
  @ValidateIf(
    (o: CreateQuestionSequenceDto) =>
      o.dependent_to === true && o.question_type === QuestableType.STANDARD,
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionSequenceRuleDto)
  @ArrayNotEmpty()
  rules: QuestionSequenceRuleDto[];

  @ApiProperty({ type: GroupQuestionsDto })
  @ValidateIf(
    (o: CreateQuestionSequenceDto) => o.question_type === QuestableType.GROUP,
  )
  @IsNotEmpty({
    message: 'group_questions is required when question_type is GROUP',
  })
  @ValidateNested()
  @Type(() => GroupQuestionsDto)
  group_questions?: GroupQuestionsDto;
}
