import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardToDashboard1760158968487 implements MigrationInterface {
  name = 'AddStandardToDashboard1760158968487';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_c1bd3f048e48f621539d303abb1"`,
    );
    await queryRunner.query(`ALTER TABLE "dashboards" ADD "standard_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_c1bd3f048e48f621539d303abb1" FOREIGN KEY ("public_question_id") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboards" ADD CONSTRAINT "FK_68f6b0f2cdc5a2f1fbbe3e95b36" FOREIGN KEY ("standard_id") REFERENCES "master_standards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboards" DROP CONSTRAINT "FK_68f6b0f2cdc5a2f1fbbe3e95b36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_c1bd3f048e48f621539d303abb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboards" DROP COLUMN "standard_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_c1bd3f048e48f621539d303abb1" FOREIGN KEY ("public_question_id") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
