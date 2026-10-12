import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class UpdateReportTemplate1751018578451 implements MigrationInterface {
  name = 'UpdateReportTemplate1751018578451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Add datacube foreign key column to report_templates table
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ADD COLUMN "datacube" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" ADD CONSTRAINT "FK_${schema}_a2e74e4cfcffdd2e50d480be0e1" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Remove the foreign key constraint and column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" DROP CONSTRAINT "FK_${schema}_a2e74e4cfcffdd2e50d480be0e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."report_templates" DROP COLUMN "datacube"`,
    );
  }
}
