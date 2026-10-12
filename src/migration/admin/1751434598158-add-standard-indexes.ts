import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardIndexes1751434598158 implements MigrationInterface {
  name = 'AddStandardIndexes1751434598158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes for better query performance on standard-related tables

    // Master standards table
    await queryRunner.query(
      `CREATE INDEX "idx_master_standards_is_deleted" ON "master_standards" ("is_deleted")`,
    );

    // Standard modules table
    await queryRunner.query(
      `CREATE INDEX "idx_standard_modules_standard_id_is_deleted" ON "standard_modules" ("standard_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_modules_master_module_id_is_deleted" ON "standard_modules" ("master_module_id", "is_deleted")`,
    );

    // Standard indicators table
    await queryRunner.query(
      `CREATE INDEX "idx_standard_indicators_standard_modules_id_is_deleted" ON "standard_indicators" ("standard_modules_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_indicators_master_indicator_id_is_deleted" ON "standard_indicators" ("master_indicator_id", "is_deleted")`,
    );

    // Standard questions table
    await queryRunner.query(
      `CREATE INDEX "idx_standard_questions_standard_indicator_id_is_deleted" ON "standard_questions" ("standard_indicator_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_questions_master_question_id_is_deleted" ON "standard_questions" ("master_question_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_questions_sub_indicator_id_is_deleted" ON "standard_questions" ("sub_indicator_id", "is_deleted")`,
    );

    // Question sequences table
    await queryRunner.query(
      `CREATE INDEX "idx_question_sequences_standard_indicator_id_is_deleted" ON "question_sequences" ("standard_indicator_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_sequences_standard_question_id_is_deleted" ON "question_sequences" ("standard_question_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_sequences_group_questions_is_deleted" ON "question_sequences" ("group_questions", "is_deleted")`,
    );

    // Group questions table - no foreign key to question_sequences, so no index needed

    // Group question sequences table
    await queryRunner.query(
      `CREATE INDEX "idx_group_question_sequences_group_questions_is_deleted" ON "group_question_sequences" ("group_questions", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_group_question_sequences_standard_question_is_deleted" ON "group_question_sequences" ("standard_question", "is_deleted")`,
    );

    // Question rules table
    await queryRunner.query(
      `CREATE INDEX "idx_question_rules_dependent_question_sequence_id_is_deleted" ON "question_rules" ("dependent_question_sequence_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_rules_parent_question_id_is_deleted" ON "question_rules" ("parent_question_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_rules_parent_option_id_is_deleted" ON "question_rules" ("parent_option_id", "is_deleted")`,
    );

    // Standard question options table
    await queryRunner.query(
      `CREATE INDEX "idx_standard_question_options_standard_question_id_is_deleted" ON "standard_question_options" ("standard_question_id", "is_deleted")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_question_options_master_option_id_is_deleted" ON "standard_question_options" ("master_option_id", "is_deleted")`,
    );

    // Mixed questions table
    await queryRunner.query(
      `CREATE INDEX "idx_mixed_questions_standard_question_is_deleted" ON "standard_mixed_questions" ("standard_question", "is_deleted")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all created indexes
    await queryRunner.query(`DROP INDEX "idx_master_standards_is_deleted"`);
    await queryRunner.query(
      `DROP INDEX "idx_standard_modules_standard_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_modules_master_module_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_indicators_standard_modules_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_indicators_master_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_questions_standard_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_questions_master_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_questions_sub_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_question_sequences_standard_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_question_sequences_standard_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_question_sequences_group_questions_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_group_question_sequences_group_questions_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_group_question_sequences_standard_question_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_question_rules_dependent_question_sequence_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_question_rules_parent_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_question_rules_parent_option_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_question_options_standard_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_standard_question_options_master_option_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "idx_mixed_questions_standard_question_is_deleted"`,
    );
  }
}
