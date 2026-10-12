import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class UpdateReportEntity1757339406062 implements MigrationInterface {
  name = 'UpdateReportEntity1757339406062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // First, drop the existing foreign key constraint and column from the previous migration
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" DROP CONSTRAINT IF EXISTS "FK_${schema}_a2e74e4cfcffdd2e50d480be0e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" DROP COLUMN IF EXISTS "datacube"`,
    );

    // Add the correct columns that match the entity definition
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ADD COLUMN IF NOT EXISTS "standard_id" character varying NOT NULL DEFAULT ''`,
    );

    // Add datacube_id as nullable first to handle existing data
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ADD COLUMN IF NOT EXISTS "datacube_id" uuid`,
    );

    // Check if there are existing records and handle them
    const existingRecords = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "${schema}"."report_templates" WHERE "datacube_id" IS NULL`,
    );

    if (existingRecords[0]?.count > 0) {
      // Skip making the column NOT NULL for now
      return;
    }

    // Now make datacube_id NOT NULL
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ALTER COLUMN "datacube_id" SET NOT NULL`,
    );

    // Add the foreign key constraint for datacube_id
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ADD CONSTRAINT "FK_${schema}_report_templates_datacube_id" FOREIGN KEY ("datacube_id") REFERENCES "${schema}"."datacube"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Remove the foreign key constraint and columns
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" DROP CONSTRAINT IF EXISTS "FK_${schema}_report_templates_datacube_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" DROP COLUMN IF EXISTS "datacube_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" DROP COLUMN IF EXISTS "standard_id"`,
    );

    // Restore the previous structure (if needed)
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ADD COLUMN "datacube" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ADD CONSTRAINT "FK_${schema}_a2e74e4cfcffdd2e50d480be0e1" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
