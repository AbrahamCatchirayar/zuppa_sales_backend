import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsHomepageToWidgetItem1761567434303
  implements MigrationInterface
{
  name = 'AddIsHomepageToWidgetItem1761567434303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_items" ADD "is_homepage_widget" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_items" DROP COLUMN "is_homepage_widget"`,
    );
  }
}
