import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomParameterEntity1755522222159
  implements MigrationInterface
{
  name = 'UpdateCustomParameterEntity1755522222159';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "custom_parameter" ADD "widget_id" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "custom_parameter" DROP COLUMN "widget_id"`,
    );
  }
}
