import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class UpdateCustomdashboardFkCascade1762000000000 implements MigrationInterface {
  name = 'UpdateCustomdashboardFkCascade1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection.options as PostgresConnectionOptions;

    // Drop existing constraints if they exist, then re-create with ON DELETE CASCADE
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_parameters" DROP CONSTRAINT IF EXISTS "FK_${schema}_b871d6b7d487d219a8c63cc93c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_parameters" ADD CONSTRAINT "FK_${schema}_b871d6b7d487d219a8c63cc93c4" FOREIGN KEY ("custom_combined_parameter_id") REFERENCES "${schema}"."custom_combined_parameters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_combined_parameters" DROP CONSTRAINT IF EXISTS "FK_${schema}_369fe1584f95bef734078b1f88b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_combined_parameters" ADD CONSTRAINT "FK_${schema}_369fe1584f95bef734078b1f88b" FOREIGN KEY ("custom_item_id") REFERENCES "${schema}"."custom_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_items" DROP CONSTRAINT IF EXISTS "FK_${schema}_8f4ed467848a3623931924f98f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_items" ADD CONSTRAINT "FK_${schema}_8f4ed467848a3623931924f98f4" FOREIGN KEY ("custom_type_id") REFERENCES "${schema}"."custom_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_block" DROP CONSTRAINT IF EXISTS "FK_${schema}_9523d5eb143230a2f4063f93cad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_block" ADD CONSTRAINT "FK_${schema}_9523d5eb143230a2f4063f93cad" FOREIGN KEY ("custom_dashboard_id") REFERENCES "${schema}"."custom_dashboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_column" DROP CONSTRAINT IF EXISTS "FK_${schema}_24670704b93905ae36bddaaca0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_column" ADD CONSTRAINT "FK_${schema}_24670704b93905ae36bddaaca0c" FOREIGN KEY ("custom_dashboard_block_id") REFERENCES "${schema}"."custom_dashboard_block"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection.options as PostgresConnectionOptions;

    // Revert constraints back to ON DELETE NO ACTION
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_column" DROP CONSTRAINT IF EXISTS "FK_${schema}_24670704b93905ae36bddaaca0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_column" ADD CONSTRAINT "FK_${schema}_24670704b93905ae36bddaaca0c" FOREIGN KEY ("custom_dashboard_block_id") REFERENCES "${schema}"."custom_dashboard_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_block" DROP CONSTRAINT IF EXISTS "FK_${schema}_9523d5eb143230a2f4063f93cad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_block" ADD CONSTRAINT "FK_${schema}_9523d5eb143230a2f4063f93cad" FOREIGN KEY ("custom_dashboard_id") REFERENCES "${schema}"."custom_dashboard"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_items" DROP CONSTRAINT IF EXISTS "FK_${schema}_8f4ed467848a3623931924f98f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_items" ADD CONSTRAINT "FK_${schema}_8f4ed467848a3623931924f98f4" FOREIGN KEY ("custom_type_id") REFERENCES "${schema}"."custom_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_combined_parameters" DROP CONSTRAINT IF EXISTS "FK_${schema}_369fe1584f95bef734078b1f88b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_combined_parameters" ADD CONSTRAINT "FK_${schema}_369fe1584f95bef734078b1f88b" FOREIGN KEY ("custom_item_id") REFERENCES "${schema}"."custom_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_parameters" DROP CONSTRAINT IF EXISTS "FK_${schema}_b871d6b7d487d219a8c63cc93c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_parameters" ADD CONSTRAINT "FK_${schema}_b871d6b7d487d219a8c63cc93c4" FOREIGN KEY ("custom_combined_parameter_id") REFERENCES "${schema}"."custom_combined_parameters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
