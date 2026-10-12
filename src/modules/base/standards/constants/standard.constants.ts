import { SelectQueryBuilder } from 'typeorm';
import { Standard } from '../standard.entity';
import { StandardModule } from '../standard_modules/standard_module.entity';

export const STANDARD_RELATIONS = [
  // 'standard_modules',
  'standard_modules.master_module',
  'standard_modules.standard_indicators',
  'standard_modules.standard_indicators.standard_questions',
  'standard_modules.standard_indicators.standard_questions.standard_question_options',
  'standard_modules.standard_indicators.question_sequences.standard_question_id',
  'standard_modules.standard_indicators.question_sequences.standard_question_id.standard_question_options',
  'standard_modules.standard_indicators.question_sequences.group_questions',
  'standard_modules.standard_indicators.question_sequences.group_questions.group_question_sequences',
  'standard_modules.standard_indicators.question_sequences.group_questions.group_question_sequences.standard_question',
  'standard_modules.standard_indicators.question_sequences.question_rules',
  'standard_modules.standard_indicators.question_sequences.question_rules.parent_question_id',
  'standard_modules.standard_indicators.question_sequences.question_rules.parent_option_id',
  'standard_modules.standard_indicators.question_sequences.question_rules.dependent_question_sequence_id',
  'standard_modules.standard_indicators.master_indicator',
  'standard_modules.standard_indicators.standard_questions.master_question',
  'standard_modules.standard_indicators.standard_questions.mixed_questions',
];

export function buildStandardRelations(
  qb: SelectQueryBuilder<Standard>,
  id?: string,
) {
  // Optimize query by applying WHERE clause early and using indexed columns
  const query = qb
    // Apply the main filter early to reduce the dataset
    .where('standard.is_deleted = false')

    // Use indexed foreign key joins for better performance
    .leftJoinAndSelect(
      'standard.standard_modules',
      'standard_modules',
      'standard_modules.is_deleted = false',
    )
    .leftJoinAndSelect('standard_modules.master_module', 'master_module')
    .leftJoinAndSelect(
      'standard_modules.standard_indicators',
      'standard_indicators',
      'standard_indicators.is_deleted = false',
    )
    .leftJoinAndSelect(
      'standard_indicators.standard_questions',
      'standard_questions',
      'standard_questions.is_deleted = false',
    )
    .leftJoinAndSelect(
      'standard_questions.sub_indicator_id',
      'sub_indicator_id',
    )
    // Optimize question sequences join with explicit foreign key
    .leftJoinAndSelect(
      'standard_indicators.question_sequences',
      'question_sequences',
      'question_sequences.is_deleted = false',
    )
    .leftJoinAndSelect(
      'question_sequences.standard_question_id',
      'qs_standard_question_id',
      'qs_standard_question_id.is_deleted = false',
    )
    .leftJoinAndSelect(
      'qs_standard_question_id.standard_question_options',
      'qs_standard_question_options',
      'qs_standard_question_options.is_deleted = false',
    )
    .leftJoinAndSelect(
      'qs_standard_question_id.master_question',
      'qs_master_question',
    )
    .leftJoinAndSelect(
      'question_sequences.group_questions',
      'group_questions',
      'group_questions.is_deleted = false',
    )
    .leftJoinAndSelect(
      'group_questions.group_question_sequences',
      'group_question_sequences',
    )
    .leftJoinAndSelect(
      'group_question_sequences.standard_question',
      'gqs_standard_question',
      'gqs_standard_question.is_deleted = false',
    )
    .leftJoinAndSelect(
      'gqs_standard_question.standard_question_options',
      'gqs_standard_question_options',
      'gqs_standard_question_options.is_deleted = false',
    )
    .leftJoinAndSelect(
      'gqs_standard_question.master_question',
      'gqs_master_question',
    )
    .leftJoinAndSelect(
      'question_sequences.question_rules',
      'question_rules',
      'question_rules.is_deleted = false',
    )
    .leftJoinAndSelect(
      'question_rules.parent_question_id',
      'parent_question_id',
    )
    .leftJoinAndSelect('question_rules.parent_option_id', 'parent_option_id')
    .leftJoinAndSelect(
      'question_rules.dependent_question_sequence_id',
      'dependent_question_sequence_id',
      'dependent_question_sequence_id.is_deleted = false',
    )
    .leftJoinAndSelect(
      'standard_indicators.master_indicator',
      'master_indicator',
    )
    .leftJoinAndSelect(
      'standard_questions.standard_question_options',
      'standard_question_options',
      'standard_question_options.is_deleted = false',
    )
    .leftJoinAndSelect('standard_questions.master_question', 'master_question')
    .leftJoinAndSelect(
      'standard_questions.mixed_questions',
      'mixed_questions',
      'mixed_questions.is_deleted = false',
    )
    .select([
      'standard.id',
      'standard.name',
      'standard_modules.id',
      'standard_modules.name',
      'standard_modules.sequence',
      'master_module.id',
      'master_module.name',
      'standard_indicators.id',
      'standard_indicators.name',
      'standard_questions.id',
      'standard_questions.title',
      'standard_questions.question_type',
      'standard_questions.is_added_sequence',
      'standard_questions.universal_question_id',
      'standard_questions.description',
      'standard_questions.placeholder',
      'standard_questions.option_type',
      'standard_question_options.id',
      'standard_question_options.text',
      'standard_question_options.value',
      'master_question.id',
      'master_question.title',
      'question_sequences.id',
      'question_sequences.sequence',
      'question_sequences.is_dependent',
      'question_sequences.questable_type',
      'question_sequences.universal_question_id',
      'qs_standard_question_id.id',
      'qs_standard_question_id.title',
      'qs_standard_question_id.question_type',
      'qs_standard_question_id.is_added_sequence',
      'qs_standard_question_id.universal_question_id',
      'qs_standard_question_id.description',
      'qs_standard_question_id.placeholder',
      'qs_standard_question_id.option_type',
      'sub_indicator_id.id',
      'sub_indicator_id.name',
      'qs_master_question.id',
      'qs_master_question.title',
      'qs_standard_question_options.id',
      'qs_standard_question_options.text',
      'qs_standard_question_options.value',
      'group_questions.id',
      'gqs_standard_question.id',
      'gqs_standard_question.title',
      'gqs_standard_question.question_type',
      'gqs_standard_question.is_added_sequence',
      'gqs_standard_question.universal_question_id',
      'gqs_standard_question.description',
      'gqs_standard_question.placeholder',
      'gqs_standard_question.option_type',
      'gqs_standard_question_options.id',
      'gqs_standard_question_options.text',
      'gqs_standard_question_options.value',
      'gqs_master_question.id',
      'gqs_master_question.title',
      'question_rules.id',
      'question_rules.parent_question_id',
      'question_rules.parent_option_id',
      'question_rules.dependent_question_sequence_id',
      'parent_question_id.id',
      'parent_question_id.title',
      'parent_option_id.id',
      'dependent_question_sequence_id.id',
      'master_indicator.id',
      'master_indicator.name',
    ]);

  // Apply specific ID filter if provided (this will use the primary key index)
  if (id) {
    query.andWhere('standard.id = :id', { id });
  }

  return query;
}

export function buildStandardModuleRelations(
  qb: SelectQueryBuilder<StandardModule>,
  id?: string,
) {
  const query = qb
    .where('standard_modules.is_deleted = false')
    .leftJoinAndSelect(
      'standard_modules.standard_indicators',
      'standard_indicators',
      'standard_indicators.is_deleted = false',
    )
    .leftJoinAndSelect(
      'standard_indicators.master_indicator',
      'master_indicator',
    );

  if (id) {
    query.andWhere('standard_modules.id = :id', { id });
  }

  return query;
}

export function _buildStandardRelations(
  qb: SelectQueryBuilder<Standard>,
  id?: string,
) {
  // Optimize query by applying WHERE clause early and using indexed columns
  const query = qb
    // Apply the main filter early to reduce the dataset
    .where('standard.is_deleted = false')

    // Use indexed foreign key joins for better performance
    .leftJoinAndSelect(
      'standard.standard_modules',
      'standard_modules',
      'standard_modules.is_deleted = false AND standard_modules.standard_id = standard.id',
    );
  // .leftJoinAndSelect(
  //   'standard_modules.master_module',
  //   'master_module',
  //   'master_module.is_deleted = false AND master_module.id = standard_modules.master_module_id',
  // )
  // .leftJoinAndSelect(
  //   'standard_modules.standard_indicators',
  //   'standard_indicators',
  //   'standard_indicators.is_deleted = false AND standard_indicators.standard_modules_id = standard_modules.id',
  // )
  // .leftJoinAndSelect(
  //   'standard_indicators.standard_questions',
  //   'standard_questions',
  //   'standard_questions.is_deleted = false AND standard_questions.standard_indicator_id = standard_indicators.id',
  // )
  // .leftJoinAndSelect(
  //   'standard_questions.sub_indicator_id',
  //   'sub_indicator_id',
  //   'sub_indicator_id.is_deleted = false AND sub_indicator_id.id = standard_questions.sub_indicator_id',
  // )
  // // Optimize question sequences join with explicit foreign key
  // .leftJoinAndSelect(
  //   'standard_indicators.question_sequences',
  //   'question_sequences',
  //   'question_sequences.is_deleted = false AND question_sequences.standard_indicator_id = standard_indicators.id',
  // )
  // .leftJoinAndSelect(
  //   'question_sequences.standard_question_id',
  //   'qs_standard_question_id',
  //   'qs_standard_question_id.is_deleted = false AND qs_standard_question_id.id = question_sequences.standard_question_id',
  // )
  // .leftJoinAndSelect(
  //   'qs_standard_question_id.standard_question_options',
  //   'qs_standard_question_options',
  //   'qs_standard_question_options.is_deleted = false AND qs_standard_question_options.standard_question_id = qs_standard_question_id.id',
  // )
  // .leftJoinAndSelect(
  //   'qs_standard_question_id.master_question',
  //   'qs_master_question',
  //   'qs_master_question.is_deleted = false AND qs_master_question.id = qs_standard_question_id.master_question_id',
  // )
  // .leftJoinAndSelect(
  //   'question_sequences.group_questions',
  //   'group_questions',
  //   'group_questions.is_deleted = false AND group_questions.id = question_sequences.group_questions',
  // )
  // .leftJoinAndSelect(
  //   'group_questions.group_question_sequences',
  //   'group_question_sequences',
  //   'group_question_sequences.is_deleted = false AND group_question_sequences.group_questions = group_questions.id',
  // )
  // .leftJoinAndSelect(
  //   'group_question_sequences.standard_question',
  //   'gqs_standard_question',
  //   'gqs_standard_question.is_deleted = false AND gqs_standard_question.id = group_question_sequences.standard_question',
  // )
  // .leftJoinAndSelect(
  //   'gqs_standard_question.master_question',
  //   'gqs_master_question',
  //   'gqs_master_question.is_deleted = false AND gqs_master_question.id = gqs_standard_question.master_question_id',
  // )
  // .leftJoinAndSelect(
  //   'question_sequences.question_rules',
  //   'question_rules',
  //   'question_rules.is_deleted = false AND question_rules.dependent_question_sequence_id = question_sequences.id',
  // )
  // .leftJoinAndSelect(
  //   'question_rules.parent_question_id',
  //   'parent_question_id',
  //   'parent_question_id.is_deleted = false AND parent_question_id.id = question_rules.parent_question_id',
  // )
  // .leftJoinAndSelect(
  //   'question_rules.parent_option_id',
  //   'parent_option_id',
  //   'parent_option_id.is_deleted = false AND parent_option_id.id = question_rules.parent_option_id',
  // )
  // .leftJoinAndSelect(
  //   'question_rules.dependent_question_sequence_id',
  //   'dependent_question_sequence_id',
  //   'dependent_question_sequence_id.is_deleted = false AND dependent_question_sequence_id.id = question_rules.dependent_question_sequence_id',
  // )
  // .leftJoinAndSelect(
  //   'standard_indicators.master_indicator',
  //   'master_indicator',
  //   'master_indicator.is_deleted = false AND master_indicator.id = standard_indicators.master_indicator_id',
  // )
  // .leftJoinAndSelect(
  //   'standard_questions.master_question',
  //   'master_question',
  //   'master_question.is_deleted = false AND master_question.id = standard_questions.master_question_id',
  // )
  // .leftJoinAndSelect(
  //   'standard_questions.mixed_questions',
  //   'mixed_questions',
  //   'mixed_questions.is_deleted = false AND mixed_questions.standard_question = standard_questions.id',
  // );

  // Apply specific ID filter if provided (this will use the primary key index)
  if (id) {
    query.andWhere('standard.id = :id', { id });
  }

  return query;
}

// Alternative optimized function for when you only need specific relations
export function buildOptimizedStandardRelations(
  qb: SelectQueryBuilder<Standard>,
  relations: string[] = [],
  id?: string,
) {
  const query = qb.where('standard.is_deleted = false');

  // Only join the relations that are actually needed
  if (relations.includes('standard_modules')) {
    query.leftJoinAndSelect(
      'standard.standard_modules',
      'standard_modules',
      'standard_modules.is_deleted = false AND standard_modules.standard_id = standard.id',
    );
  }

  if (relations.includes('standard_modules.master_module')) {
    query.leftJoinAndSelect(
      'standard_modules.master_module',
      'master_module',
      'master_module.is_deleted = false AND master_module.id = standard_modules.master_module_id',
    );
  }

  if (relations.includes('standard_modules.standard_indicators')) {
    query.leftJoinAndSelect(
      'standard_modules.standard_indicators',
      'standard_indicators',
      'standard_indicators.is_deleted = false AND standard_indicators.standard_modules_id = standard_modules.id',
    );
  }

  // Add more conditional joins based on relations array...

  if (id) {
    query.andWhere('standard.id = :id', { id });
  }

  return query;
}

export const STANDARD_ROUTES = {
  BASE: 'admin/standards',
  STANDARD_ID: ':standard_id',
  MODULES: ':standard_id/modules',
  INDICATORS: ':standard_id/modules/:standard_module_id/indicators',
  QUESTIONS:
    ':standard_id/:standard_module_id/:standard_indicator_id/questions',
  SEQUENCE: ':standard_id/sequence',
  ADD_QUESTION: ':standard_id/add_questions',
  ADD_BYMODULE: ':standard_id/add_bymodule',
  ADD_REMOVE_QUESTION_SEQUENCE: ':standard_id/question_sequence',
  ADD_REMOVE_QUESTION_RULES: ':standard_id/question_rules',
  ADD_UPDATE_REMOVE_GROUP_QUESTION: ':standard_id/group_questions',
  ADD_STANDARD_QUESTIONS:
    ':standard_id/modules/:module_id/indicator/:indicator_id/questions',
} as const;

export const STANDARD_MODULE_RELATIONS = [
  'standard',
  'master_module',
  'standard_indicators',
  'standard_indicators.standard_questions',
  'standard_indicators.standard_questions.standard_question_options',
  'standard_indicators.question_sequences.standard_question_id',
  'standard_indicators.question_sequences.group_questions',
  'standard_indicators.question_sequences.question_rules',
  'standard_indicators.question_sequences.question_rules.parent_question_id',
  'standard_indicators.question_sequences.question_rules.parent_option_id',
  'standard_indicators.question_sequences.question_rules.dependent_question_sequence_id',
  'standard_indicators.master_indicator',
  'standard_indicators.standard_questions.master_question',
  'standard_indicators.standard_questions.mixed_questions',
];
