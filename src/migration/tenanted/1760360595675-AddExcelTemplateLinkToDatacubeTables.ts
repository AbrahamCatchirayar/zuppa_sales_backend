import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddExcelTemplateLinkToDatacubeTables1759999999999
  implements MigrationInterface
{
  name = 'AddExcelTemplateLinkToDatacubeTables1759999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    // Add column to datacube table
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube" ADD "excel_template_link" character varying`,
    );
    // Add column to datacube_frequency table
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" ADD "excel_template_link" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    // Remove column from datacube_frequency table
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" DROP COLUMN "excel_template_link"`,
    );
    // Remove column from datacube table
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube" DROP COLUMN "excel_template_link"`,
    );
  }
}
