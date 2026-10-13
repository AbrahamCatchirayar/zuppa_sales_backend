import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAdmin1770000000001 implements MigrationInterface {
  name = 'InitialAdmin1770000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // admin_roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_roles" (
        "name" character varying NOT NULL,
        CONSTRAINT "PK_admin_roles_name" PRIMARY KEY ("name")
      );
    `);

    // admin_user
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_type" character varying,
        "created_by" character varying,
        "refresh_token" character varying,
        "email" character varying NOT NULL,
        "phone_number" character varying,
        "password" character varying,
        "first_name" character varying,
        "last_name" character varying,
        "status" character varying,
        "confirmed_at" TIMESTAMP,
        "invitation_token" character varying,
        "password_reset_on" TIMESTAMP,
        "invitation_token_sent_at" TIMESTAMP,
        "accept_terms_of_service" boolean NOT NULL DEFAULT false,
        "forget_password_token" character varying,
        "forget_password_token_sent_at" TIMESTAMP,
        "avatar_url" character varying,
        "blocked_reason" character varying,
        "blocked_on" TIMESTAMP,
        "created_by_user" uuid,
        "role" character varying,
        CONSTRAINT "UQ_admin_user_email" UNIQUE ("email"),
        CONSTRAINT "UQ_admin_user_refresh_token" UNIQUE ("refresh_token"),
        CONSTRAINT "UQ_admin_user_forget_password_token" UNIQUE ("forget_password_token"),
        CONSTRAINT "PK_admin_user_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_admin_user_role" FOREIGN KEY ("role") REFERENCES "admin_roles"("name") ON DELETE SET NULL,
        CONSTRAINT "FK_admin_user_created_by_user" FOREIGN KEY ("created_by_user") REFERENCES "admin_user"("id") ON DELETE CASCADE
      );
    `);

    // admin_role_access
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_role_access" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_type" character varying,
        "created_by" character varying,
        "features" text array DEFAULT '{}',
        "module" character varying NOT NULL,
        "role" character varying,
        CONSTRAINT "PK_admin_role_access_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_admin_role_access_role" FOREIGN KEY ("role") REFERENCES "admin_roles"("name") ON DELETE CASCADE
      );
    `);

    // master_account
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "master_account" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_deleted" boolean NOT NULL DEFAULT false,
        "deleted_at" TIMESTAMP,
        "name" character varying NOT NULL,
        "account_name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "email" character varying NOT NULL,
        "website_url" character varying,
        "official_email_id" character varying,
        "phone_number" character varying,
        "api_key" character varying,
        "tax_id" character varying,
        "address" character varying,
        "status" character varying,
        "time_frame" character varying,
        "invitation_sent_at" TIMESTAMP,
        "invitation_token" character varying,
        "confirmed_at" TIMESTAMP,
        "blocked_reason" character varying,
        "suspended_reason" character varying,
        "deleted_reason" character varying,
        "deleted_by" character varying,
        "suspended_on" TIMESTAMP,
        "blocked_on" TIMESTAMP,
        "created_by" uuid,
        "reviewed_by" uuid,
        "suspended_by" uuid,
        "sectors" text array,
        "industries" text array,
        "standards" text array,
        CONSTRAINT "UQ_master_account_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_master_account_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_master_account_created_by" FOREIGN KEY ("created_by") REFERENCES "admin_user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_master_account_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "admin_user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_master_account_suspended_by" FOREIGN KEY ("suspended_by") REFERENCES "admin_user"("id") ON DELETE CASCADE
      );
    `);

    // master_roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "master_roles" (
        "name" character varying NOT NULL,
        CONSTRAINT "PK_master_roles_name" PRIMARY KEY ("name")
      );
    `);

    // master_role_access
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "master_role_access" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by_type" character varying,
        "created_by" character varying,
        "features" text array DEFAULT '{}',
        "module" character varying NOT NULL,
        "role" character varying,
        CONSTRAINT "PK_master_role_access_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_master_role_access_role" FOREIGN KEY ("role") REFERENCES "master_roles"("name") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_master_role_access_role_module" ON "master_role_access" ("role", "module");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "master_role_access" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "master_roles" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "master_account" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "admin_role_access" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "admin_user" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "admin_roles" CASCADE;');
  }
}
