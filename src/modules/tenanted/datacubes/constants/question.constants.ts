export const QUESTIONS_RELATIONS = [
  'question_sequence',
  'question_sequence.datacube_question',
  'question_sequence.datacube_question.datacube_question_options',
  // 'question_sequence.datacube_question.datacube_question_options.datacube_question_option_values',
  'question_sequence.datacube_question.mixed_questions',
  // 'question_sequence.datacube_question.datacube_question_rules',
  'question_sequence.group_question_rule',
  'question_sequence.group_question_rule.datacube_group_questions',
  'question_sequence.group_question_rule.datacube_group_questions.datacube_question',
  'question_sequence.group_question_rule.datacube_group_questions.datacube_question.datacube_question_options',
  'question_sequence.group_question_rule.datacube_group_questions.group_question_rule',
  // 'question_sequence.group_question_rule.datacube_group_questions.datacube_group_question',
  'question_sequence.question_rules_id',
  'question_sequence.question_rules_id.dependent_question_id',
  'question_sequence.question_rules_id.dependent_option_id',
  'question_sequence.question_rules_id.dependent_question_id.datacube_question_options',
  // 'question_sequence.question_rules_id.dependent_question_id.datacube_question_options.datacube_question_option_values',
  // 'question_sequence.question_rules_id.dependent_question_id.datacube_question_options.datacube_question_option_values.datacube_question_option_value_options',
  // 'question_sequence.question_rules_id.dependent_question_id.datacube_question_options.datacube_question_option_values.datacube_question_option_value_options.datacube_question_option_value_option_values',
];

export const DATA_CUBE_RELATIONS = [
  'datacube_frequency',
  'datacube_frequency.datacube_config',
  'datacube_frequency.task',
  'datacube_frequency.task.site',
  'datacube_frequency.task.site.business_unit',
  'datacube_frequency.task.data_provider',
  'datacube_frequency.task.data_reviewer',
];

export const DATA_CUBE_SELECT_CONFIG = {
  relations: DATA_CUBE_RELATIONS,
  select: {
    datacube_frequency: {
      task: {
        data_provider: {
          id: true,
          email: true,
          name: true,
          status: true,
        },
        data_reviewer: {
          id: true,
          email: true,
          name: true,
          status: true,
        },
      },
    },
  },
};
