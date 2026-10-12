import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddConsolidatedEntity1754990128883 implements MigrationInterface {
  name = 'AddConsolidatedEntity1754990128883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `CREATE TABLE "${schema}"."all_response" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "question_type" character varying NOT NULL, "questable_type" character varying, "universal_question_id" character varying NOT NULL, "answer" character varying NOT NULL, "group_questions_rule_id" uuid, "rule_question_id" uuid, "datacube_id" uuid NOT NULL, "site_id" uuid NOT NULL, "datacubefrequency_id" uuid NOT NULL, CONSTRAINT "PK_f7cc0be658fc60bfd3f7c0f0fe1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "all_response_index" ON "${schema}"."all_response" ("datacube_id", "universal_question_id", "site_id", "datacubefrequency_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."consolidated_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "consolidated_response" character varying NOT NULL, "question_type" character varying NOT NULL, "questable_type" character varying, "universal_question_id" character varying NOT NULL, "datacube_id" uuid NOT NULL, CONSTRAINT "PK_fb8c96f96bf5e3fedcb29679911" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "consolidated_response_index" ON "${schema}"."consolidated_responses" ("datacube_id", "universal_question_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" ADD CONSTRAINT "FK_${schema}_93471a782b607884c75ac5da6b4" FOREIGN KEY ("group_questions_rule_id") REFERENCES "${schema}"."datacube_group_questions_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" ADD CONSTRAINT "FK_${schema}_7d63d1bd2a11e2a859cf73bfa43" FOREIGN KEY ("rule_question_id") REFERENCES "${schema}"."datacube_question_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" ADD CONSTRAINT "FK_${schema}_f5bd44a463372a37d292cfe17fd" FOREIGN KEY ("datacube_id") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" ADD CONSTRAINT "FK_${schema}_712fd8f9dd3b226a71e965a5ca6" FOREIGN KEY ("site_id") REFERENCES "${schema}"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" ADD CONSTRAINT "FK_${schema}_eaa334aef4d05ae023e9e5db190" FOREIGN KEY ("datacubefrequency_id") REFERENCES "${schema}"."datacube_frequency"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."consolidated_responses" ADD CONSTRAINT "FK_${schema}_9e01a692067f3865b47be01ad4d" FOREIGN KEY ("datacube_id") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `ALTER TABLE "${schema}"."consolidated_responses" DROP CONSTRAINT "FK_${schema}_9e01a692067f3865b47be01ad4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" DROP CONSTRAINT "FK_${schema}_eaa334aef4d05ae023e9e5db190"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" DROP CONSTRAINT "FK_${schema}_712fd8f9dd3b226a71e965a5ca6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" DROP CONSTRAINT "FK_${schema}_f5bd44a463372a37d292cfe17fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" DROP CONSTRAINT "FK_${schema}_7d63d1bd2a11e2a859cf73bfa43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."all_response" DROP CONSTRAINT "FK_${schema}_93471a782b607884c75ac5da6b4"`,
    );
    await queryRunner.query(
      `DROP INDEX "${schema}"."consolidated_response_index"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."consolidated_responses"`);
    await queryRunner.query(`DROP INDEX "${schema}"."all_response_index"`);
    await queryRunner.query(`DROP TABLE "${schema}"."all_response"`);
  }
}
