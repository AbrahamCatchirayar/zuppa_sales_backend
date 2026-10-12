export const TASK_RELATIONS = [
  {
    alias: 'datacube_frequency',
    path: 'datacube_frequency',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube',
    path: 'datacube_frequency.datacube',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'site',
    path: 'site',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'data_provider',
    path: 'data_provider',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'data_reviewer',
    path: 'data_reviewer',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task_questions',
    path: 'task_questions',
    type: 'leftJoinAndSelect',
    order: {
      createdAt: 'ASC',
    },
  },
  {
    alias: 'question_sequence',
    path: 'task_questions.question_sequence',
    type: 'leftJoinAndSelect',
    order: {
      createdAt: 'ASC',
    },
  },
  {
    alias: 'datacube_question',
    path: 'task_questions.question_sequence.datacube_question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube_question_options',
    path: 'task_questions.question_sequence.datacube_question.datacube_question_options',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'mixed_questions',
    path: 'task_questions.question_sequence.datacube_question.mixed_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question_rule',
    path: 'task_questions.question_sequence.group_question_rule',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube_group_questions',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question_datacube_question',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.datacube_question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question_options',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.datacube_question.datacube_question_options',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question_mixed',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.datacube_question.mixed_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'nested_group_rule',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.group_question_rule',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'nested_group_questions',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.group_question_rule.datacube_group_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'nested_question',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.group_question_rule.datacube_group_questions.datacube_question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'nested_options',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.group_question_rule.datacube_group_questions.datacube_question.datacube_question_options',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'nested_mixed',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.group_question_rule.datacube_group_questions.datacube_question.mixed_questions.question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'nested_mixed_question',
    path: 'task_questions.question_sequence.group_question_rule.datacube_group_questions.group_question_rule.datacube_group_questions.datacube_question.mixed_questions.question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'question_rules',
    path: 'task_questions.question_sequence.question_rules_id',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'dependent_question',
    path: 'task_questions.question_sequence.question_rules_id.dependent_question_id',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'dependent_option',
    path: 'task_questions.question_sequence.question_rules_id.dependent_option_id',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task_question_answers',
    path: 'task_questions.task_question_answers',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'answer_datacube_question',
    path: 'task_questions.task_question_answers.datacube_question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task_comments',
    path: 'task_questions.task_comments',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'commented_by',
    path: 'task_questions.task_comments.commented_by',
    type: 'leftJoinAndSelect',
  },
];

// fetching all the task against the datacube_id from datacube_frequency table
export const TASK_DATACUBE_RELATIONS = [
  {
    alias: 'task',
    path: 'task',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube',
    path: 'task.datacube_frequency.datacube',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'site',
    path: 'task.site',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'data_provider',
    path: 'task.data_provider',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'data_reviewer',
    path: 'task.data_reviewer',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'question_options',
    path: 'task.task_questions.question_sequence.datacube_question.datacube_question_options',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'mixed_questions',
    path: 'task.task_questions.question_sequence.datacube_question.mixed_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question_rule',
    path: 'task.task_questions.question_sequence.group_question_rule',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube_group_questions',
    path: 'task.task_questions.question_sequence.group_question_rule.datacube_group_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question',
    path: 'task.task_questions.question_sequence.group_question_rule.datacube_group_questions.datacube_question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question_options',
    path: 'task.task_questions.question_sequence.group_question_rule.datacube_group_questions.datacube_question.datacube_question_options',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'nested_group_rule',
    path: 'task.task_questions.question_sequence.group_question_rule.datacube_group_questions.group_question_rule',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'question_rules',
    path: 'task.task_questions.question_sequence.question_rules_id',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'dependent_question',
    path: 'task.task_questions.question_sequence.question_rules_id.dependent_question_id',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'dependent_option',
    path: 'task.task_questions.question_sequence.question_rules_id.dependent_option_id',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task_question_answers',
    path: 'task.task_questions.task_question_answers',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task_comments',
    path: 'task.task_questions.task_comments',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'commented_by',
    path: 'task.task_questions.task_comments.commented_by',
    type: 'leftJoinAndSelect',
  },
];

export const TASK_DATACUBE = [
  {
    alias: 'task',
    path: 'task',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube',
    path: 'task.datacube_frequency.datacube',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'site',
    path: 'task.site',
    type: 'leftJoinAndSelect',
    select: ['id', 'name', 'location'],
  },
  {
    alias: 'data_provider',
    path: 'task.data_provider',
    type: 'leftJoinAndSelect',
    select: ['id', 'email', 'name', 'status'],
  },
  {
    alias: 'data_reviewer',
    path: 'task.data_reviewer',
    type: 'leftJoinAndSelect',
    select: ['id', 'email', 'name', 'status'],
  },
  {
    alias: 'datacube_question',
    path: 'task.task_questions.question_sequence.datacube_question',
    type: 'leftJoinAndSelect',
    select: ['id', 'module_name', 'indicator_name'],
  },
];

export const DATA_CUBE_RELATIONS = [
  {
    alias: 'datacube_frequency',
    path: 'datacube_frequency',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task',
    path: 'datacube_frequency.task',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task_questions',
    path: 'datacube_frequency.task.task_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'question_sequence',
    path: 'datacube_frequency.task.task_questions.question_sequence',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube_question',
    path: 'datacube_frequency.task.task_questions.question_sequence.datacube_question',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'datacube_question_options',
    path: 'datacube_frequency.task.task_questions.question_sequence.datacube_question.datacube_question_options',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'mixed_questions',
    path: 'datacube_frequency.task.task_questions.question_sequence.datacube_question.mixed_questions',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'group_question_rule',
    path: 'datacube_frequency.task.task_questions.question_sequence.group_question_rule',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'task_question_answers',
    path: 'datacube_frequency.task.task_questions.task_question_answers',
    type: 'leftJoinAndSelect',
  },
];
export const WIDGET_RELATIONS = [
  {
    alias: 'module',
    path: 'module',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'indicator',
    path: 'indicator',
    type: 'leftJoinAndSelect',
  },
  // {
  //   alias: 'department_id',
  //   path: 'department_id',
  //   type: 'leftJoinAndSelect'
  // }
  {
    alias: 'widget_blocks',
    path: 'widget_blocks',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'widget_columns',
    path: 'widget_blocks.widget_columns',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'widget_types',
    path: 'widget_blocks.widget_columns.widget_types',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'widget_item',
    path: 'widget_blocks.widget_columns.widget_types.widget_item',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'combined_parameters',
    path: 'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters',
    type: 'leftJoinAndSelect',
  },
  {
    alias: 'custom_parameters',
    path: 'widget_blocks.widget_columns.widget_types.widget_item.combined_parameters.custom_parameter',
    type: 'leftJoinAndSelect',
  },
];
