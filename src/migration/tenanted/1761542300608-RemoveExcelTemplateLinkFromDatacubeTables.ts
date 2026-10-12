import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class RemoveExcelTemplateLinkFromDatacubeTables1761542300608
  implements MigrationInterface
{
  name = 'RemoveExcelTemplateLinkFromDatacubeTables1761542300608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" DROP COLUMN IF EXISTS "excel_template_link"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube" DROP COLUMN IF EXISTS "excel_template_link"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube" ADD "excel_template_link" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" ADD "excel_template_link" character varying`,
    );
  }
}
