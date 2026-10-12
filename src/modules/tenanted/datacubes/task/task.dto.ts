import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TaskStatus } from './task.entity';

// Custom transformer to convert empty strings to undefined
const TransformEmptyStringToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export class CreateDataCubeTask {
  @ApiProperty()
  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty({ each: true })
  sites: string[];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID('all', { each: true })
  questions: string[];

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  data_provider: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  data_reviewer: string;

  @ApiProperty({ default: TaskStatus.CREATED })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateDataCubeTaskDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  datacube_id: string;

  @ApiProperty({
    type: [CreateDataCubeTask],
    description: 'Array of question review data',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDataCubeTask)
  tasks: CreateDataCubeTask[];
}

export class TaskFiltersDto {
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
  @IsUUID()
  site?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  data_provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  data_reviewer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateDataCubeTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  datacube_frequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  site?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  data_provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  data_reviewer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class TaskResponseDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  task_question: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  datacube_question: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  answer: string | string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_sequence_type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parent_option_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mixed_question_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rule_question_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group_questions_rule_id: string;
}

export class ResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
    description: 'Array of task response with the required properties.',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskResponseDto)
  responses: TaskResponseDto[];
}

export class UpdateTaskResponseDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  task_question: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  datacube_question: string;

  @ApiProperty()
  // @IsNotEmpty()
  @IsString({ each: true })
  answer: string | string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_sequence_type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parent_option_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mixed_question_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rule_question_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  group_questions_rule_id: string;
}

export class FrequencyAnswerDto {
  @ApiProperty({ description: 'Task question UID or ID', example: 'UID_927' })
  @IsString()
  questionUid: string;

  @ApiProperty({
    description: 'Indicates if this question is part of a group',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;

  @ApiProperty({
    description: 'Array of answers (string or number)',
    example: ['Answer 1', 10, 'Yes'],
  })
  @IsArray()
  @IsOptional()
  answers: (string | number)[];
}

export class BulkUploadDto {
  @ApiProperty({ description: 'Datacube ID', example: '' })
  @IsString()
  @IsNotEmpty()
  datacubeId: string;

  @ApiProperty({ description: 'Module ID', example: '', required: false })
  @IsString()
  @IsOptional()
  moduleId?: string;

  @ApiProperty({ description: 'Site ID', example: '', required: false })
  @IsString()
  @IsOptional()
  siteId?: string;

  @ApiProperty({
    description: 'Frequency answers mapped by frequency (e.g. Q1, Q2, etc.)',
    example: {
      Q1: [
        {
          questionUid: 'UID_927',
          isGroup: true,
          answers: ['Yes', 'No', 10],
        },
      ],
    },
  })
  @IsObject()
  frequency: Record<string, FrequencyAnswerDto[]>;

  // ✅ ADD THIS NEW FIELD
  @ApiPropertyOptional({ description: 'URL of the uploaded Excel file in S3' })
  @IsString()
  @IsOptional()
  uploadedFileUrl?: string;

  // ✅ Flag to distinguish yearly vs per-frequency uploads
  @ApiPropertyOptional({ description: 'True if this is a yearly sheet upload' })
  @IsBoolean()
  @IsOptional()
  isYearly?: boolean;
}

export class TaskComments {
  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  task_question_id: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  commented_by: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  comment: string;
}

export class TaskCommentsDto {
  @ApiProperty({
    type: [TaskComments],
    description: 'Array of task comments with the required properties.',
  })
  @ValidateNested({ each: true })
  @Type(() => TaskComments)
  task_comments: TaskComments[];
}

export class ReassignTaskDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsOptional()
  data_reviewer: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsOptional()
  data_provider: string;
}

export class ApproveTaskDto {
  @ApiProperty()
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: string;
}

class QuestionReview {
  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  question_id: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  is_approved: boolean;
}
export class ReviewTaskQuestionDto {
  @ApiProperty({
    type: [QuestionReview],
    description: 'Array of question review data',
  })
  @ValidateNested({ each: true })
  @Type(() => QuestionReview)
  @IsArray()
  questions: QuestionReview[];
}

export class GroupQuestionDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  question_sequence: string;
}

export class DeleteGroupQuestionDto {
  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  task_question_id: string;
}

export class TaskFiltersByUser {
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
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  site_name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  task_status?: string;
}

export class BulkReassignTaskDto {
  @ApiProperty({
    description: 'Array of task IDs to reassign',
    type: [String],
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty({ each: true })
  task_ids: string[];

  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsOptional()
  data_reviewer: string;

  @ApiProperty()
  @IsUUID()
  @IsString()
  @IsOptional()
  data_provider: string;
}