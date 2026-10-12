import { MigrationInterface, QueryRunner } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export class UpdateCustomParameterEntity1764230448267 implements MigrationInterface {
    name = 'UpdateCustomParameterEntity1764230448267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const { schema } = queryRunner.connection.options as PostgresConnectionOptions;
        await queryRunner.query(`ALTER TABLE "${schema}"."custom_parameters" ADD "answer" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const { schema } = queryRunner.connection.options as PostgresConnectionOptions;
        await queryRunner.query(`ALTER TABLE "${schema}"."custom_parameters" DROP COLUMN "answer"`);
    }

}
