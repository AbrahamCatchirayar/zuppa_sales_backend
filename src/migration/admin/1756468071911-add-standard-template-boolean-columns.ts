import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardTemplateBooleanColumns1756468071911
  implements MigrationInterface
{
  name = 'AddStandardTemplateBooleanColumns1756468071911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "standard_template_questions" ADD "is_previous_year" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_template_questions" ADD "is_prior_year" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "standard_template_questions" DROP COLUMN "is_previous_year"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_template_questions" DROP COLUMN "is_prior_year"`,
    );
  }
}
