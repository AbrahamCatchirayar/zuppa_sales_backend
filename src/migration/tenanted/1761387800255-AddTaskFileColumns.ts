import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddTaskFileColumns1761387800255 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`
            ALTER TABLE "${schema}"."datacube_task"
            ADD COLUMN "template_task_file_url" text,
            ADD COLUMN "template_yearly_file_url" text,
            ADD COLUMN "uploaded_task_file_url" text,
            ADD COLUMN "uploaded_yearly_file_url" text;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`
            ALTER TABLE "${schema}"."datacube_task"
            DROP COLUMN "template_task_file_url",
            DROP COLUMN "template_yearly_file_url",
            DROP COLUMN "uploaded_task_file_url",
            DROP COLUMN "uploaded_yearly_file_url";
        `);
  }
}
