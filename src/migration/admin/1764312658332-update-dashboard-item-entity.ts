import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDashboardItemEntity1764312658332 implements MigrationInterface {
    name = 'UpdateDashboardItemEntity1764312658332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dashboard_items" ADD "is_homepage_dashboard" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dashboard_items" DROP COLUMN "is_homepage_dashboard"`);
    }

}
