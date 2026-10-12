import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddTenantactivitylogEntity1765281944804
  implements MigrationInterface
{
  name = 'AddTenantactivitylogEntity1765281944804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `CREATE TABLE "${schema}"."tenantactivitylog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "activity_type" character varying NOT NULL, "datacube_id" uuid, "task_id" uuid, "user_id" uuid, CONSTRAINT "PK_${schema}_c0023a79ea10c68cd089e2897dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."tenantactivitylog" ADD CONSTRAINT "FK_${schema}_ba0f8d0b6e3361e71728caebdf9" FOREIGN KEY ("datacube_id") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."tenantactivitylog" ADD CONSTRAINT "FK_${schema}_51bcbbee6765dc563bd3a54e00d" FOREIGN KEY ("task_id") REFERENCES "${schema}"."datacube_task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."tenantactivitylog" ADD CONSTRAINT "FK_${schema}_1122b16b5d0fe13d80400039211" FOREIGN KEY ("user_id") REFERENCES "${schema}"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `ALTER TABLE "${schema}"."tenantactivitylog" DROP CONSTRAINT "FK_${schema}_1122b16b5d0fe13d80400039211"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."tenantactivitylog" DROP CONSTRAINT "FK_${schema}_51bcbbee6765dc563bd3a54e00d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."tenantactivitylog" DROP CONSTRAINT "FK_${schema}_ba0f8d0b6e3361e71728caebdf9"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."tenantactivitylog"`);
  }
}
