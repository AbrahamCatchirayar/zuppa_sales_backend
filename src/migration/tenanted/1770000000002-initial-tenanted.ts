import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class InitialTenanted1770000000002 implements MigrationInterface {
  name = 'InitialTenanted1770000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."roles" (
        "name" character varying NOT NULL,
        CONSTRAINT "PK_${schema}_roles_name" PRIMARY KEY ("name")
      );
    `);

    // role_access
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."role_access" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_type" character varying,
        "created_by" character varying,
        "features" text array DEFAULT '{}',
        "module" character varying NOT NULL,
        "role" character varying,
        CONSTRAINT "PK_${schema}_role_access_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_${schema}_role_access_role" FOREIGN KEY ("role") REFERENCES "${schema}"."roles"("name") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_${schema}_role_access_role_module" ON "${schema}"."role_access" ("role", "module");
    `);

    // user
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_deleted" boolean NOT NULL DEFAULT false,
        "deleted_at" TIMESTAMP,
        "email" character varying NOT NULL,
        "password" character varying,
        "refresh_token" character varying,
        "name" character varying,
        "accept_terms_of_service" boolean NOT NULL DEFAULT false,
        "phone_number" character varying,
        "status" character varying,
        "is_owner" boolean DEFAULT false,
        "invitation_token" character varying,
        "invitation_sent_at" TIMESTAMP,
        "invitation_confirmed_at" TIMESTAMP,
        "confirmation_token" character varying,
        "confirmation_token_sent_at" character varying,
        "confirmed_at" TIMESTAMP,
        "role" character varying,
        "last_login_at" TIMESTAMP,
        "forgot_password_token" character varying,
        "forgot_password_sent_at" TIMESTAMP,
        "password_reset_token" character varying,
        "password_reset_on" TIMESTAMP,
        "avatar_url" character varying,
        "blocked_at" TIMESTAMP,
        "blocked_reason" character varying,
        "blocked_on" TIMESTAMP,
        CONSTRAINT "UQ_${schema}_user_email" UNIQUE ("email"),
        CONSTRAINT "UQ_${schema}_user_refresh_token" UNIQUE ("refresh_token"),
        CONSTRAINT "PK_${schema}_user_id" PRIMARY KEY ("id")
      );
    `);

    // account
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."account" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_deleted" boolean NOT NULL DEFAULT false,
        "deleted_at" TIMESTAMP,
        "account_name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "email" character varying NOT NULL,
        "website_url" character varying,
        "official_email_id" character varying,
        "phone_number" character varying,
        "api_key" character varying,
        "current_onboarding_stage" integer NOT NULL DEFAULT 0,
        "tax_id" character varying,
        "address" character varying,
        "logo_path" character varying,
        "user" uuid,
        "sectors" text array,
        "industries" text array,
        "standards" text array,
        CONSTRAINT "UQ_${schema}_account_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_${schema}_account_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_${schema}_account_user" FOREIGN KEY ("user") REFERENCES "${schema}"."user"("id") ON DELETE SET NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."account" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."user" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."role_access" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."roles" CASCADE;`);
  }
}
