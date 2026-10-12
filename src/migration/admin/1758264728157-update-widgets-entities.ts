import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWidgetsEntities1758264728157 implements MigrationInterface {
  name = 'UpdateWidgetsEntities1758264728157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" ADD "dashboard_custom_parameter_sequence" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD "dashboard_filter_sequence" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "combined_parameter" ADD "widget_combined_parameter_sequence" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_parameter" ADD "widget_custom_parameter_sequence" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" ADD "widget_filter_sequence" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_filters" DROP COLUMN "widget_filter_sequence"`,
    );
    await queryRunner.query(
      `ALTER TABLE "combined_parameter" DROP COLUMN "widget_combined_parameter_sequence"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_parameter" DROP COLUMN "widget_custom_parameter_sequence"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP COLUMN "dashboard_filter_sequence"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" DROP COLUMN "dashboard_custom_parameter_sequence"`,
    );
  }
}
