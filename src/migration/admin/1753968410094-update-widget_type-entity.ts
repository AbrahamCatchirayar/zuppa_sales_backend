import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWidgetTypeEntity1753968410094 implements MigrationInterface {
  name = 'UpdateWidgetTypeEntity1753968410094';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_types" ADD "is_time_series" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_types" DROP COLUMN "is_time_series"`,
    );
  }
}
