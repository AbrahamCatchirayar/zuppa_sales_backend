import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddDisclosureEntity1753968982421 implements MigrationInterface {
  name = 'AddDisclosureEntity1753968982421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `CREATE TABLE "${schema}"."disclosures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "financial_year" character varying NOT NULL, "indicator_name" character varying NOT NULL, "answer" json, "submitted_by" uuid, CONSTRAINT "PK_${schema}_891a486784239e16ba51491fd1c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${schema}_DISCLOSURES" ON "${schema}"."disclosures" ("name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD CONSTRAINT "FK_${schema}_1d8ee900971bda5838d17fa1c75" FOREIGN KEY ("submitted_by") REFERENCES "${schema}"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" ADD COLUMN "is_time_series" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP CONSTRAINT "FK_${schema}_1d8ee900971bda5838d17fa1c75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."disclosures" DROP COLUMN "is_time_series"`,
    );
    await queryRunner.query(
      `DROP INDEX "${schema}"."IDX_${schema}_DISCLOSURES"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."disclosures"`);
  }
}
