import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDashboardEntity1757499814505 implements MigrationInterface {
  name = 'UpdateDashboardEntity1757499814505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" DROP CONSTRAINT "FK_7bb5a8e7db0a67e71eba2e02968"`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_filters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "universal_question_id" character varying, "is_option" boolean, "public_question_id" uuid, "dashboard_item_id" uuid, CONSTRAINT "PK_b0a6658f92f1555f2434143d1df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c1bd3f048e48f621539d303abb" ON "dashboard_filters" ("public_question_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_items" ADD "filter" boolean DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" ADD CONSTRAINT "FK_7bb5a8e7db0a67e71eba2e02968" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_c1bd3f048e48f621539d303abb1" FOREIGN KEY ("public_question_id") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" ADD CONSTRAINT "FK_0f18278e8c1dd14aa3652d13441" FOREIGN KEY ("dashboard_item_id") REFERENCES "dashboard_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_0f18278e8c1dd14aa3652d13441"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_filters" DROP CONSTRAINT "FK_c1bd3f048e48f621539d303abb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" DROP CONSTRAINT "FK_7bb5a8e7db0a67e71eba2e02968"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_items" DROP COLUMN "filter"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c1bd3f048e48f621539d303abb"`,
    );
    await queryRunner.query(`DROP TABLE "dashboard_filters"`);
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" ADD CONSTRAINT "FK_7bb5a8e7db0a67e71eba2e02968" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
