import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDashboardEntity1758370363938 implements MigrationInterface {
  name = 'UpdateDashboardEntity1758370363938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_c1bd3f048e48f621539d303abb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_c1bd3f048e48f621539d303abb1" FOREIGN KEY ("public_question_id") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_c1bd3f048e48f621539d303abb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_c1bd3f048e48f621539d303abb1" FOREIGN KEY ("public_question_id") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
