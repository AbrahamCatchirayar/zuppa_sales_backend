import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddScheduleSpecAndRole1770000000006 implements MigrationInterface {
  name = 'AddScheduleSpecAndRole1770000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Insert PRODUCTION_SCHEDULER role if not exists
    await queryRunner.query(`
      INSERT INTO "${schema}"."roles" ("name")
      SELECT 'PRODUCTION_SCHEDULER'
      WHERE NOT EXISTS (
        SELECT 1 FROM "${schema}"."roles" WHERE "name" = 'PRODUCTION_SCHEDULER'
      );
    `);

    // Add schedule_spec column to sales_job_orders if not exists
    await queryRunner.query(`
      ALTER TABLE "${schema}"."sales_job_orders"
      ADD COLUMN IF NOT EXISTS "schedule_spec" jsonb DEFAULT '{}'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`
      ALTER TABLE "${schema}"."sales_job_orders"
      DROP COLUMN IF EXISTS "schedule_spec";
    `);
  }
}
