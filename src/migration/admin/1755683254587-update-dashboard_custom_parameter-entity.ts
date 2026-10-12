import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDashboardCustomParameterEntity1755683254587
  implements MigrationInterface
{
  name = 'UpdateDashboardCustomParameterEntity1755683254587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" ADD "dashboard_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" ADD CONSTRAINT "FK_7bb5a8e7db0a67e71eba2e02968" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" DROP CONSTRAINT "FK_7bb5a8e7db0a67e71eba2e02968"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" DROP COLUMN "dashboard_id"`,
    );
  }
}
