import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuestionEntity1759485063737 implements MigrationInterface {
  name = 'UpdateQuestionEntity1759485063737';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "standard_questions" ADD "is_latest_data" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_questions" ADD "is_latest_data" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_questions" DROP COLUMN "is_latest_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" DROP COLUMN "is_latest_data"`,
    );
  }
}
