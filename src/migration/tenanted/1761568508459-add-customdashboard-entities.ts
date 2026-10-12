import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddCustomdashboardEntities1761568508459
  implements MigrationInterface
{
  name = 'AddCustomdashboardEntities1761568508459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_parameters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "questions" text array, "universal_questions" text array, "macro_function" character varying, "unit" character varying, "legends" text array, "label" text array, "custom_item_id" text, "custom_combined_parameter_id" uuid, CONSTRAINT "PK_${schema}_5c577bbf0b841f1d779ff30e3bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_combined_parameters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "custom_item_id" uuid, CONSTRAINT "PK_${schema}_a6c1b72f4e0f46523d303dc85b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "custom_type_id" uuid, CONSTRAINT "PK_${schema}_9538088322f24d757ab4048f719" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "type" character varying NOT NULL, "chart_type" character varying, "is_stacked" boolean DEFAULT false, "is_horizontal" boolean DEFAULT false, "is_metric" boolean DEFAULT false, "is_time_series" boolean DEFAULT false, CONSTRAINT "PK_${schema}_e48ef0d7fe4c8b3edcb11a5dfc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_dashboard" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "number_of_blocks" integer NOT NULL, "sequence" integer NOT NULL, CONSTRAINT "PK_${schema}_6c33c76cd9ac810d279e6aa356e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_dashboard_block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "number_of_columns" integer NOT NULL, "sequence" integer NOT NULL, "custom_dashboard_id" uuid, CONSTRAINT "PK_${schema}_d9b0d2dfd0a464f32ff328aa872" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_dashboard_column" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "custom_dashboard_block_id" uuid, CONSTRAINT "PK_${schema}_aa929843a7b9b961940f8bfc931" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."custom_dashboard_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "widget_type_id" uuid, "dashboard_type_id" uuid, "custom_dashboard_column_id" uuid, "custom_type_id" uuid, CONSTRAINT "PK_${schema}_43674ebec86ad0eb619f5f411a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_parameters" ADD CONSTRAINT "FK_${schema}_b871d6b7d487d219a8c63cc93c4" FOREIGN KEY ("custom_combined_parameter_id") REFERENCES "${schema}"."custom_combined_parameters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_combined_parameters" ADD CONSTRAINT "FK_${schema}_369fe1584f95bef734078b1f88b" FOREIGN KEY ("custom_item_id") REFERENCES "${schema}"."custom_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_items" ADD CONSTRAINT "FK_${schema}_8f4ed467848a3623931924f98f4" FOREIGN KEY ("custom_type_id") REFERENCES "${schema}"."custom_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_block" ADD CONSTRAINT "FK_${schema}_9523d5eb143230a2f4063f93cad" FOREIGN KEY ("custom_dashboard_id") REFERENCES "${schema}"."custom_dashboard"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_column" ADD CONSTRAINT "FK_${schema}_24670704b93905ae36bddaaca0c" FOREIGN KEY ("custom_dashboard_block_id") REFERENCES "${schema}"."custom_dashboard_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_type" ADD CONSTRAINT "FK_${schema}_a3dd834d457acd0a3405bdc3e38" FOREIGN KEY ("custom_dashboard_column_id") REFERENCES "${schema}"."custom_dashboard_column"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_type" ADD CONSTRAINT "FK_${schema}_3b3807609d992989f1bb08be6c9" FOREIGN KEY ("custom_type_id") REFERENCES "${schema}"."custom_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_type" DROP CONSTRAINT "FK_${schema}_3b3807609d992989f1bb08be6c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_type" DROP CONSTRAINT "FK_${schema}_a3dd834d457acd0a3405bdc3e38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_column" DROP CONSTRAINT "FK_${schema}_24670704b93905ae36bddaaca0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_dashboard_block" DROP CONSTRAINT "FK_${schema}_9523d5eb143230a2f4063f93cad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_items" DROP CONSTRAINT "FK_${schema}_8f4ed467848a3623931924f98f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_combined_parameters" DROP CONSTRAINT "FK_${schema}_369fe1584f95bef734078b1f88b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."custom_parameters" DROP CONSTRAINT "FK_${schema}_b871d6b7d487d219a8c63cc93c4"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."custom_dashboard_type"`);
    await queryRunner.query(`DROP TABLE "${schema}"."custom_dashboard_column"`);
    await queryRunner.query(`DROP TABLE "${schema}"."custom_dashboard_block"`);
    await queryRunner.query(`DROP TABLE "${schema}"."custom_dashboard"`);
    await queryRunner.query(`DROP TABLE "${schema}"."custom_types"`);
    await queryRunner.query(`DROP TABLE "${schema}"."custom_items"`);
    await queryRunner.query(
      `DROP TABLE "${schema}"."custom_combined_parameters"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."custom_parameters"`);
  }
}
