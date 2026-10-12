import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWidgetItemEntity1754629017888 implements MigrationInterface {
  name = 'UpdateWidgetItemEntity1754629017888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "widget_items" DROP COLUMN "filter"`);
    await queryRunner.query(
      `ALTER TABLE "widget_items" ADD "filter" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "widget_items" DROP COLUMN "filter"`);
    await queryRunner.query(
      `ALTER TABLE "widget_items" ADD "filter" text array NOT NULL`,
    );
  }
}
