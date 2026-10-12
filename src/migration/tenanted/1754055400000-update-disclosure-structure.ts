import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class UpdateDisclosureStructure1754055400000
  implements MigrationInterface
{
  name = 'UpdateDisclosureStructure1754055400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    // Drop the old columns if they exist
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN IF EXISTS "indicator_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN IF EXISTS "answer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN IF EXISTS "is_time_series"`,
    );

    // Add the new indicators column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN "indicators" json`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    // Remove the new column
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN "indicators"`,
    );

    // Restore the old columns
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN "indicator_name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN "answer" json`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN "is_time_series" boolean NOT NULL DEFAULT false`,
    );
  }
}
