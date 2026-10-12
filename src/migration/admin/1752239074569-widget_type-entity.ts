import { MigrationInterface, QueryRunner } from 'typeorm';

export class WidgetTypeEntity1752239074569 implements MigrationInterface {
  name = 'WidgetTypeEntity1752239074569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_group_question_sequences_group_questions_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_group_question_sequences_standard_question_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_question_sequences_standard_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_question_sequences_standard_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_question_sequences_group_questions_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_question_rules_dependent_question_sequence_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_question_rules_parent_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_question_rules_parent_option_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_question_options_standard_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_question_options_master_option_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_mixed_questions_standard_question_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_questions_standard_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_questions_master_question_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_questions_sub_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_indicators_standard_modules_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_indicators_master_indicator_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_modules_standard_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_standard_modules_master_module_id_is_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_master_standards_is_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_types" ADD "latest_data" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_types" DROP COLUMN "latest_data"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_master_standards_is_deleted" ON "master_standards" ("is_deleted") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_modules_master_module_id_is_deleted" ON "standard_modules" ("is_deleted", "master_module_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_modules_standard_id_is_deleted" ON "standard_modules" ("is_deleted", "standard_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_indicators_master_indicator_id_is_deleted" ON "standard_indicators" ("is_deleted", "master_indicator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_indicators_standard_modules_id_is_deleted" ON "standard_indicators" ("is_deleted", "standard_modules_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_questions_sub_indicator_id_is_deleted" ON "standard_questions" ("is_deleted", "sub_indicator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_questions_master_question_id_is_deleted" ON "standard_questions" ("is_deleted", "master_question_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_questions_standard_indicator_id_is_deleted" ON "standard_questions" ("is_deleted", "standard_indicator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mixed_questions_standard_question_is_deleted" ON "standard_mixed_questions" ("is_deleted", "standard_question") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_question_options_master_option_id_is_deleted" ON "standard_question_options" ("is_deleted", "master_option_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_standard_question_options_standard_question_id_is_deleted" ON "standard_question_options" ("is_deleted", "standard_question_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_rules_parent_option_id_is_deleted" ON "question_rules" ("is_deleted", "parent_option_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_rules_parent_question_id_is_deleted" ON "question_rules" ("is_deleted", "parent_question_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_rules_dependent_question_sequence_id_is_deleted" ON "question_rules" ("dependent_question_sequence_id", "is_deleted") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_sequences_group_questions_is_deleted" ON "question_sequences" ("group_questions", "is_deleted") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_sequences_standard_question_id_is_deleted" ON "question_sequences" ("is_deleted", "standard_question_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_question_sequences_standard_indicator_id_is_deleted" ON "question_sequences" ("is_deleted", "standard_indicator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_group_question_sequences_standard_question_is_deleted" ON "group_question_sequences" ("is_deleted", "standard_question") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_group_question_sequences_group_questions_is_deleted" ON "group_question_sequences" ("group_questions", "is_deleted") `,
    );
  }
}
