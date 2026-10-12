export interface QuestionRuleDto {
  id: string;

  dependent_question_sequence_id: string;

  parent_question_id: {
    id: string;
    title: string;
    description?: string;
  };

  parent_option_id?: {
    id: string;
    text?: string;
    value?: string;
  };
}

export interface StandardQuestionOptionDto {
  id: string;
  text?: string;
  value?: string;
}

export interface StandardSubIndicatorDto {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
}

export interface DepartmentDto {
  id: string;
  name: string;
  description?: string;
}

export interface MixedTypeQuestionDto {
  id: string;
  value_question_type: string;
  value_name: string;
  value_enum: string[];
  unit_name: string;
  unit_type: string;
  unit_enum: string[];
}

export interface GroupQuestionsDto {
  id: string;
  name: string;
  is_multiple: boolean;
  max_limit: number;
  group_rule?: Record<string, any>[];

  group_question_sequences: GroupQuestionSequenceDto[];
}

export interface GroupQuestionSequenceDto {
  id: string;
  standard_question: StandardQuestionDto;
  is_dependent: boolean;
  group_sequence: number;
}

export interface StandardQuestionDto {
  id: string;
  title: string;
  description?: string;
  question_type: string;
  placeholder?: string;
  standard_question_options: StandardQuestionOptionDto[];
  sub_indicator_id?: StandardSubIndicatorDto;
  department?: DepartmentDto;
  mixed_questions?: MixedTypeQuestionDto[];
  universal_question_id: string;
  is_latest_data: boolean;
}

export interface QuestionSequenceDto {
  id: string;
  sequence: number;
  is_dependent: boolean;
  questable_type: string;
  standard_question_id?: StandardQuestionDto;
  group_questions?: GroupQuestionsDto;
  question_rules?: QuestionRuleDto[];
  universal_question_id: string;
}

export interface Indicator {
  id: string;
  name: string;
  standard_question: StandardQuestionDto[];
  question_sequence: QuestionSequenceDto[];
}

export interface ConsolidatedModule {
  id: string;
  name: string;
  indicators: Indicator[];
}
