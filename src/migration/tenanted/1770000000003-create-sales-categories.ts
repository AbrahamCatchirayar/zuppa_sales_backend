import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class CreateSalesCategories1770000000003 implements MigrationInterface {
  name = 'CreateSalesCategories1770000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // sales_categories
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."sales_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "code" character varying NOT NULL,
        "description" character varying,
        "parent_branch" character varying,
        CONSTRAINT "PK_${schema}_sales_categories_id" PRIMARY KEY ("id")
      );
    `);

    // sales_option_codes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."sales_option_codes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "category_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "code" character varying NOT NULL,
        CONSTRAINT "PK_${schema}_sales_option_codes_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_${schema}_sales_option_codes_category" FOREIGN KEY ("category_id") REFERENCES "${schema}"."sales_categories"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_${schema}_sales_option_codes_cat" ON "${schema}"."sales_option_codes" ("category_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."sales_option_codes";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."sales_categories";`);
  }
}
