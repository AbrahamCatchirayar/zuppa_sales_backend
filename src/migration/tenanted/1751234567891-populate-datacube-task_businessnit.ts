/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class PopulateDatacubeTaskBusinessUnit1751234567891 implements MigrationInterface {
  name = 'PopulateDatacubeTaskBusinessUnit1751234567891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Populate business_unit from site relationship
    await queryRunner.query(
      `UPDATE "${schema}"."datacube_task" dt
       SET business_unit = s.business_unit
       FROM "${schema}"."sites" s
       WHERE dt.site = s.id AND s.business_unit IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Clear business_unit values
    await queryRunner.query(
      `UPDATE "${schema}"."datacube_task" SET business_unit = NULL`,
    );
  }
}