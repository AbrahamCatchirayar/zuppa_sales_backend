/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class UpdateDatacubeTask1751234567890 implements MigrationInterface {
  name = 'UpdateDatacubeTask1751234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Check if column exists before adding
    const table = await queryRunner.getTable(`${schema}.datacube_task`);
    const hasColumn = table?.findColumnByName('business_unit');

    if (!hasColumn) {
      // Add business_unit foreign key column to datacube_task table
      await queryRunner.query(
        `ALTER TABLE "${schema}"."datacube_task" ADD COLUMN "business_unit" uuid`,
      );
    }

    // Check if foreign key constraint exists before adding
    const hasForeignKey = table?.foreignKeys.some(
      (fk) => fk.columnNames.includes('business_unit'),
    );

    if (!hasForeignKey) {
      await queryRunner.query(
        `ALTER TABLE "${schema}"."datacube_task" ADD CONSTRAINT "FK_${schema}_datacube_task_business_unit" FOREIGN KEY ("business_unit") REFERENCES "${schema}"."business_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Remove the foreign key constraint and column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" DROP CONSTRAINT IF EXISTS "FK_${schema}_datacube_task_business_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" DROP COLUMN IF EXISTS "business_unit"`,
    );
  }
}