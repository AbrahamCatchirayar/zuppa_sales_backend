import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWidgetsEntity1758287694271 implements MigrationInterface {
  name = 'UpdateWidgetsEntity1758287694271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_c1bd3f048e48f621539d303abb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" DROP CONSTRAINT "FK_5d188c20dfe70df6bd8bcac19b9"`,
    );

    // Set orphaned public_question_id values to NULL for records that don't exist in standard_questions
    await queryRunner.query(
      `UPDATE "dashboard_filters" SET "public_question_id" = NULL WHERE "public_question_id" NOT IN (SELECT "id" FROM "standard_questions")`,
    );
    await queryRunner.query(
      `UPDATE "widget_filters" SET "public_question_id" = NULL WHERE "public_question_id" NOT IN (SELECT "id" FROM "standard_questions")`,
    );

    // Add new foreign key constraints referencing standard_questions
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_c1bd3f048e48f621539d303abb1" FOREIGN KEY ("public_question_id") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" ADD CONSTRAINT "FK_5d188c20dfe70df6bd8bcac19b9" FOREIGN KEY ("public_question_id") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_filters" DROP CONSTRAINT "FK_5d188c20dfe70df6bd8bcac19b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_c1bd3f048e48f621539d303abb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" ADD CONSTRAINT "FK_5d188c20dfe70df6bd8bcac19b9" FOREIGN KEY ("public_question_id") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_c1bd3f048e48f621539d303abb1" FOREIGN KEY ("public_question_id") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
