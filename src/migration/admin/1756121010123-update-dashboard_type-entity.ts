import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDashboardTypeEntity1756121010123
  implements MigrationInterface
{
  name = 'UpdateDashboardTypeEntity1756121010123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Only add the two new columns to dashboard_types table
    await queryRunner.query(
      `ALTER TABLE "dashboard_types" ADD "is_time_series" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_types" ADD "latest_data" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns if migration is rolled back
    await queryRunner.query(
      `ALTER TABLE "dashboard_types" DROP COLUMN "latest_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_types" DROP COLUMN "is_time_series"`,
    );
  }
}
