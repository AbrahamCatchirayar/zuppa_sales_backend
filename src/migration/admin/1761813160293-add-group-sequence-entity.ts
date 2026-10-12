import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupSequenceEntity1761813160293 implements MigrationInterface {
  name = 'AddGroupSequenceEntity1761813160293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists before adding
    const table = await queryRunner.getTable('group_question_sequences');
    const columnExists = table?.columns.find(
      (column) => column.name === 'group_sequence',
    );

    if (!columnExists) {
      await queryRunner.query(
        `ALTER TABLE "group_question_sequences" ADD "group_sequence" integer NOT NULL DEFAULT 0`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before dropping
    const table = await queryRunner.getTable('group_question_sequences');
    const columnExists = table?.columns.find(
      (column) => column.name === 'group_sequence',
    );

    if (columnExists) {
      await queryRunner.query(
        `ALTER TABLE "group_question_sequences" DROP COLUMN "group_sequence"`,
      );
    }
  }
}
