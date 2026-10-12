import { MigrationInterface, QueryRunner } from 'typeorm';

export class Admin1756463942671 implements MigrationInterface {
  name = 'Admin1756463942671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "widget_filters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "is_option" boolean, "public_question_id" character varying, "widget_item_id" uuid, CONSTRAINT "PK_f9672470efb9f98bec3cf58f92b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d188c20dfe70df6bd8bcac19b" ON "widget_filters" ("public_question_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_filters" ADD CONSTRAINT "FK_36d6b2ba9677bc9ac66adc0ae9a" FOREIGN KEY ("widget_item_id") REFERENCES "widget_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "widget_filters" DROP CONSTRAINT "FK_36d6b2ba9677bc9ac66adc0ae9a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d188c20dfe70df6bd8bcac19b"`,
    );
    await queryRunner.query(`DROP TABLE "widget_filters"`);
  }
}
