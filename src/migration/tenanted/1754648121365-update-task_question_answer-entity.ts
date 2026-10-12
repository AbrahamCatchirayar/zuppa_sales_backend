import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class UpdateTaskQuestionAnswerEntity1754648121365
  implements MigrationInterface
{
  name = 'UpdateTaskQuestionAnswerEntity1754648121365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // First, add the missing columns
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD COLUMN "parent_option_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD COLUMN "mixed_question_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD COLUMN "rule_question_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD COLUMN "group_questions_rule_id" uuid`,
    );

    // Then add the foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD CONSTRAINT "FK_f243c5fdb9fe82be83671b2e804" FOREIGN KEY ("datacube_question") REFERENCES "${schema}"."datacube_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD CONSTRAINT "FK_53c9100e0429405f561acd6ece9" FOREIGN KEY ("parent_option_id") REFERENCES "${schema}"."datacube_question_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD CONSTRAINT "FK_dbc3b2a7c5508c80180b2211722" FOREIGN KEY ("mixed_question_id") REFERENCES "${schema}"."datacube_mixed_type_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD CONSTRAINT "FK_0709e36bd6a932b517e31861175" FOREIGN KEY ("rule_question_id") REFERENCES "${schema}"."datacube_question_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD CONSTRAINT "FK_1a05554b41ae24b6533a2cdb0f1" FOREIGN KEY ("group_questions_rule_id") REFERENCES "${schema}"."datacube_group_questions_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // First drop the foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP CONSTRAINT "FK_1a05554b41ae24b6533a2cdb0f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP CONSTRAINT "FK_0709e36bd6a932b517e31861175"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP CONSTRAINT "FK_dbc3b2a7c5508c80180b2211722"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP CONSTRAINT "FK_53c9100e0429405f561acd6ece9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP CONSTRAINT "FK_f243c5fdb9fe82be83671b2e804"`,
    );

    // Then drop the columns
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP COLUMN "group_questions_rule_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP COLUMN "rule_question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP COLUMN "mixed_question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP COLUMN "parent_option_id"`,
    );
  }
}
