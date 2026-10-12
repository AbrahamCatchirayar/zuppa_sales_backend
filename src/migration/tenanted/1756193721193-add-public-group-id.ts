import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicGroupId1756193721193 implements MigrationInterface {
  name = 'AddPublicGroupId1756193721193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection.options as any;

    // Add the column as nullable first
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions_rules" ADD "public_group_id" character varying`,
    );

    // Update existing records with a default value
    // await queryRunner.query(`UPDATE "${schema}"."datacube_group_questions_rules" SET "public_group_id" = 'default' WHERE "public_group_id" IS NULL`);

    // Make the column NOT NULL
    // await queryRunner.query(`ALTER TABLE "${schema}"."datacube_group_questions_rules" ALTER COLUMN "public_group_id" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection.options as any;
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions_rules" DROP COLUMN "public_group_id"`,
    );
  }
}
