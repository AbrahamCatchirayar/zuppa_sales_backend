import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStandard1uestionEntity1763558152529
  implements MigrationInterface
{
  name = 'UpdateStandard1uestionEntity1763558152529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" DROP CONSTRAINT "FK_c38587f07d37c34327f61e6c2f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_5996206d3067a0f7960a9d19c30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_adfbf26ee98813070fe7414e8c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_f162fe2ad6b27eb8ab59d1625ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" DROP CONSTRAINT "FK_a0f59b169c2ba1c0e026aee4f44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" DROP CONSTRAINT "FK_cf456cc925f3ea4b26bc94af43f"`,
    );
    // await queryRunner.query(
    //   `ALTER TABLE "widget_items" ADD "is_homepage_widget" boolean DEFAULT false`,
    // );
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" ADD CONSTRAINT "FK_c38587f07d37c34327f61e6c2f2" FOREIGN KEY ("standard_question") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_5996206d3067a0f7960a9d19c30" FOREIGN KEY ("dependent_question_sequence_id") REFERENCES "question_sequences"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_adfbf26ee98813070fe7414e8c6" FOREIGN KEY ("parent_question_id") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_f162fe2ad6b27eb8ab59d1625ce" FOREIGN KEY ("parent_option_id") REFERENCES "standard_question_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" ADD CONSTRAINT "FK_a0f59b169c2ba1c0e026aee4f44" FOREIGN KEY ("master_option_id") REFERENCES "question_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" ADD CONSTRAINT "FK_cf456cc925f3ea4b26bc94af43f" FOREIGN KEY ("master_question_id") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "standard_questions" DROP CONSTRAINT "FK_cf456cc925f3ea4b26bc94af43f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" DROP CONSTRAINT "FK_a0f59b169c2ba1c0e026aee4f44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_f162fe2ad6b27eb8ab59d1625ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_adfbf26ee98813070fe7414e8c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_5996206d3067a0f7960a9d19c30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" DROP CONSTRAINT "FK_c38587f07d37c34327f61e6c2f2"`,
    );
    // await queryRunner.query(
    //   `ALTER TABLE "widget_items" DROP COLUMN "is_homepage_widget"`,
    // );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" ADD CONSTRAINT "FK_cf456cc925f3ea4b26bc94af43f" FOREIGN KEY ("master_question_id") REFERENCES "master_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" ADD CONSTRAINT "FK_a0f59b169c2ba1c0e026aee4f44" FOREIGN KEY ("master_option_id") REFERENCES "question_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_f162fe2ad6b27eb8ab59d1625ce" FOREIGN KEY ("parent_option_id") REFERENCES "standard_question_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_adfbf26ee98813070fe7414e8c6" FOREIGN KEY ("parent_question_id") REFERENCES "standard_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_5996206d3067a0f7960a9d19c30" FOREIGN KEY ("dependent_question_sequence_id") REFERENCES "question_sequences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" ADD CONSTRAINT "FK_c38587f07d37c34327f61e6c2f2" FOREIGN KEY ("standard_question") REFERENCES "standard_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
