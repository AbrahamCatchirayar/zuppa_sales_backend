import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class UpdateDisclosureEntity1755948809818 implements MigrationInterface {
  name = 'UpdateDisclosureEntity1755948809818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Drop the old financial_year column if it exists
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN IF EXISTS "financial_year"`,
    );

    // Add the new datacube_id column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN "datacube_id" uuid`,
    );

    // Add the indicators column if it doesn't exist
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN IF NOT EXISTS "indicators" json`,
    );

    // Add foreign key constraint for datacube_id
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD CONSTRAINT "FK_disclosures_datacube" FOREIGN KEY ("datacube_id") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Drop the foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP CONSTRAINT IF EXISTS "FK_disclosures_datacube"`,
    );

    // Drop the new columns
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN IF EXISTS "datacube_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN IF EXISTS "indicators"`,
    );

    // Restore the old financial_year column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN "financial_year" character varying`,
    );
  }
}
