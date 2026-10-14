import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class CreateConfiguredProducts1770000000004 implements MigrationInterface {
  name = 'CreateConfiguredProducts1770000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."sales_configured_products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "product_code" character varying NOT NULL,
        "revision_number" character varying NOT NULL DEFAULT 'R0',
        "revision_date" character varying,
        "configuration" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "status" character varying NOT NULL DEFAULT 'PUBLISHED',
        CONSTRAINT "PK_${schema}_sales_configured_products_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."sales_configured_products";`);
  }
}
