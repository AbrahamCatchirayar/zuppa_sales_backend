import { MigrationInterface, QueryRunner } from 'typeorm';

export class WidgetFilterUpdate1756468071910 implements MigrationInterface {
  name = 'WidgetFilterUpdate1756468071910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if universal_question_id column exists, if not add it
    const hasUniversalQuestionId = await queryRunner.hasColumn(
      'widget_filters',
      'universal_question_id',
    );
    if (!hasUniversalQuestionId) {
      await queryRunner.query(
        `ALTER TABLE "widget_filters" ADD "universal_question_id" character varying`,
      );
    }

    // Handle public_question_id changes - drop index, change type, recreate index and FK
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d188c20dfe70df6bd8bcac19b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" DROP COLUMN "public_question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" ADD "public_question_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d188c20dfe70df6bd8bcac19b" ON "widget_filters" ("public_question_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" ADD CONSTRAINT "FK_5d188c20dfe70df6bd8bcac19b9" FOREIGN KEY ("public_question_id") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert public_question_id changes
    await queryRunner.query(
      `ALTER TABLE "widget_filters" DROP CONSTRAINT "FK_5d188c20dfe70df6bd8bcac19b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d188c20dfe70df6bd8bcac19b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" DROP COLUMN "public_question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" ADD "public_question_id" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d188c20dfe70df6bd8bcac19b" ON "widget_filters" ("public_question_id") `,
    );

    // Drop the universal_question_id column if it exists
    const hasUniversalQuestionId = await queryRunner.hasColumn(
      'widget_filters',
      'universal_question_id',
    );
    if (hasUniversalQuestionId) {
      await queryRunner.query(
        `ALTER TABLE "widget_filters" DROP COLUMN "universal_question_id"`,
      );
    }
  }
}
