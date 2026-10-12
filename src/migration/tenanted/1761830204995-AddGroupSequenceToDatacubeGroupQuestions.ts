/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddGroupSequenceToDatacubeGroupQuestions1761830204995 implements MigrationInterface {
  name = 'AddGroupSequenceToDatacubeGroupQuestions1761830204995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Just add the column
    await queryRunner.query(`
      ALTER TABLE "${schema}".datacube_group_questions
      ADD COLUMN IF NOT EXISTS group_sequence int4 NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Remove the column
    await queryRunner.query(`
      ALTER TABLE "${schema}".datacube_group_questions
      DROP COLUMN IF EXISTS group_sequence;
    `);
  }
}