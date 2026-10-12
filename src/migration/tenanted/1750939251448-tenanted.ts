import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class Tenanted1750939251448 implements MigrationInterface {
  name = 'Tenanted1750939251448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `CREATE TABLE "${schema}"."user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "email" character varying NOT NULL, "password" character varying, "refresh_token" character varying, "name" character varying, "accept_terms_of_service" boolean NOT NULL DEFAULT false, "phone_number" character varying, "status" character varying, "is_owner" boolean DEFAULT false, "invitation_token" character varying, "invitation_sent_at" TIMESTAMP, "invitation_confirmed_at" TIMESTAMP, "confirmation_token" character varying, "confirmation_token_sent_at" character varying, "confirmed_at" TIMESTAMP, "role" character varying NOT NULL, "last_login_at" TIMESTAMP, "forgot_password_token" character varying, "forgot_password_sent_at" TIMESTAMP, "password_reset_token" character varying, "password_reset_on" TIMESTAMP, "avatar_url" character varying, "blocked_at" TIMESTAMP, "blocked_reason" character varying, "blocked_on" TIMESTAMP, CONSTRAINT "UQ_${schema}_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_${schema}_a2deb244eda661a007db72f0dbf" UNIQUE ("refresh_token"), CONSTRAINT "PK_${schema}_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "account_name" character varying NOT NULL, "slug" character varying NOT NULL, "email" character varying NOT NULL, "website_url" character varying, "official_email_id" character varying, "phone_number" character varying, "api_key" character varying, "current_onboarding_stage" integer NOT NULL DEFAULT '0', "tax_id" character varying, "address" character varying, "logo_path" character varying, "sectors" text array, "industries" text array, "standards" text array, "user" uuid, CONSTRAINT "UQ_${schema}_d4ab593c192bae26a6cf6386332" UNIQUE ("slug"), CONSTRAINT "PK_${schema}_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."business_unit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "account" uuid, CONSTRAINT "UQ_${schema}_d8e04aae3f7cc604ed8d3303bbc" UNIQUE ("name"), CONSTRAINT "PK_${schema}_842dd03ad7a179a295f55c01008" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${schema}_BUSINESS_UNITS" ON "${schema}"."business_unit" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_mixed_type_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "value_question_type" character varying NOT NULL, "value_name" character varying NOT NULL, "value_enum" text array, "unit_name" character varying NOT NULL, "unit_type" character varying NOT NULL, "unit_enum" text array, "question" uuid, "datacube" uuid, CONSTRAINT "PK_${schema}_250d0d4f74a555398079c940e19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${schema}_mixed_type_id" ON "${schema}"."datacube_mixed_type_questions" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_question_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "question_sequence_id" uuid, "dependent_question_id" uuid, "dependent_option_id" uuid, "datacube" uuid, CONSTRAINT "PK_${schema}_7a780af87aa4fe1273a201053d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_question_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "text" character varying, "value" character varying, "placeholder" character varying, "public_question_option_id" character varying, "datacube_question_id" uuid, "datacube" uuid, CONSTRAINT "PK_${schema}_043f74ecd747fd651bad444b934" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "description" character varying, "question_type" character varying NOT NULL DEFAULT 'TEXT', "placeholder" character varying, "sub_indicator_id" character varying, "sub_indicator_name" character varying, "department_id" character varying, "department_name" character varying, "option_type" character varying NOT NULL, "universal_question_id" character varying NOT NULL, "public_question_id" character varying, "datacube" uuid, CONSTRAINT "PK_${schema}_a0db7480959d770bb9bd6ef5971" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_group_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "is_dependent" boolean NOT NULL DEFAULT false, "universal_question_id" character varying NOT NULL, "group_questions_rule" uuid, "datacube_question" uuid, "datacube" uuid, CONSTRAINT "PK_${schema}_6086fb6cdacf1603573dd3000c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_group_questions_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "is_multiple" boolean NOT NULL, "name" character varying NOT NULL, "max_limit" integer NOT NULL, "group_rule" jsonb, "datacube" uuid, CONSTRAINT "PK_${schema}_d9bb694b25f56e43a3ab00f6cde" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."task_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "comment" character varying, "task" uuid, "task_question" uuid, "commented_by" uuid, CONSTRAINT "PK_${schema}_83b99b0b03db29d4cafcb579b77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."task_question_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "answer" jsonb, "universal_question_id" character varying NOT NULL, "question_sequence_type" character varying, "index" integer, "task_question" uuid, "datacube_question" uuid, CONSTRAINT "PK_${schema}_a4451acbb91e6562d001812c220" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."task_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "universal_question_id" character varying NOT NULL, "is_approved" boolean, "approved_at" TIME, "site" character varying, "datacube_frequency" character varying, "approved_by" character varying, "data_provided_on" TIME, "is_answered" boolean, "task" uuid, "question_sequence" uuid, CONSTRAINT "PK_${schema}_a07261605d16a4246e2de4e41ae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "task_questions_task_question_sequence_idx" ON "${schema}"."task_questions" ("task", "question_sequence") `,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_question_sequences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "is_dependent" boolean NOT NULL, "questable_type" character varying NOT NULL, "public_indicator_id" character varying, "public_indicator_name" character varying, "public_module_id" character varying, "public_module_name" character varying, "public_question_sequence_id" character varying, "universal_question_id" character varying NOT NULL, "group_question_rule" uuid, "datacube" uuid, "datacube_question" uuid, CONSTRAINT "PK_${schema}_c8c82ca75b8a7dc7fa525c1395a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_${schema}_b90371bc0ad896f18011ecbeef" ON "${schema}"."datacube_question_sequences" ("datacube", "datacube_question") `,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP NOT NULL, "datacube_id" uuid, CONSTRAINT "REL_${schema}_2540564f065cbd8623ef5c5978" UNIQUE ("datacube_id"), CONSTRAINT "PK_${schema}_805af668d52c2bfb1450a3beeea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "frequency" character varying, "financial_year" character varying, "status" character varying, "standards" json, CONSTRAINT "PK_${schema}_e7eb570d87c6d39c1f634596882" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_frequency" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "frequency_name" character varying, "status" character varying DEFAULT 'CREATED', "datacube" uuid, "datacube_config" uuid, CONSTRAINT "PK_${schema}_149761251bc26741ed1a748fdc2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."datacube_task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "status" character varying, "datacube_frequency" uuid, "site" uuid, "data_provider" uuid, "data_reviewer" uuid, CONSTRAINT "PK_${schema}_268cade0ec9f4869b1b46110bf2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "datacube_task_datacube_frequency_site_idx" ON "${schema}"."datacube_task" ("datacube_frequency", "site") `,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."sites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "location" character varying NOT NULL, "business_unit" uuid, CONSTRAINT "PK_${schema}_4f5eccb1dfde10c9170502595a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."roles" ("name" character varying NOT NULL, CONSTRAINT "PK_${schema}_648e3f5447f725579d7d4ffdfb7" PRIMARY KEY ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."role_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_type" character varying, "created_by" character varying, "features" text array NOT NULL DEFAULT '{}', "module" character varying NOT NULL, "role" character varying, CONSTRAINT "PK_${schema}_d53bf5646eeebac0ed7665061ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_${schema}_b6fcaaf9d000472b2d6e6c8b38" ON "${schema}"."role_access" ("role", "module") `,
    );
    await queryRunner.query(
      `CREATE TYPE "${schema}"."jobs_status_enum" AS ENUM('pending', 'in progress', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "report_name" character varying NOT NULL, "status" "${schema}"."jobs_status_enum" NOT NULL DEFAULT 'pending', "type" character varying NOT NULL, "report_url" character varying, CONSTRAINT "PK_${schema}_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."report_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "standard" character varying NOT NULL, "financial_year" character varying NOT NULL, "status" character varying DEFAULT 'pending', "type" character varying NOT NULL, "url" character varying NOT NULL, "report_name" character varying NOT NULL, CONSTRAINT "PK_${schema}_f85e16e6beea41a2b3a3350b84e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."account" ADD CONSTRAINT "FK_${schema}_8fc20d11bc8a878e337ec9fda5b" FOREIGN KEY ("user") REFERENCES "${schema}"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."business_unit" ADD CONSTRAINT "FK_${schema}_431b62d5283622ee10073e7b4e3" FOREIGN KEY ("account") REFERENCES "${schema}"."account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_mixed_type_questions" ADD CONSTRAINT "FK_${schema}_418a97dd617396633bc9f48824e" FOREIGN KEY ("question") REFERENCES "${schema}"."datacube_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_mixed_type_questions" ADD CONSTRAINT "FK_${schema}_753b5f6f89b2d955cf6be3129e4" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" ADD CONSTRAINT "FK_${schema}_9a6e81b1097978fc75c895dd628" FOREIGN KEY ("question_sequence_id") REFERENCES "${schema}"."datacube_question_sequences"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" ADD CONSTRAINT "FK_${schema}_c5b46f9484ea98410b01d86422a" FOREIGN KEY ("dependent_question_id") REFERENCES "${schema}"."datacube_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" ADD CONSTRAINT "FK_${schema}_eaa3b50f8da89a069440b15b23a" FOREIGN KEY ("dependent_option_id") REFERENCES "${schema}"."datacube_question_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" ADD CONSTRAINT "FK_${schema}_bd758fe4b530c4e4a16a56c934e" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_options" ADD CONSTRAINT "FK_${schema}_4655fac0969a805c73ec725639c" FOREIGN KEY ("datacube_question_id") REFERENCES "${schema}"."datacube_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_options" ADD CONSTRAINT "FK_${schema}_3fe239b0db8a6af2d8162041316" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_questions" ADD CONSTRAINT "FK_${schema}_76c4492b4bec66dfed784de5d01" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions" ADD CONSTRAINT "FK_${schema}_20bb0cd63af9923d07b353ea2dd" FOREIGN KEY ("group_questions_rule") REFERENCES "${schema}"."datacube_group_questions_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions" ADD CONSTRAINT "FK_${schema}_5eee2022d44ef692fc2d113927f" FOREIGN KEY ("datacube_question") REFERENCES "${schema}"."datacube_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions" ADD CONSTRAINT "FK_${schema}_72c25848b4c1b67eba462bdbf8f" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions_rules" ADD CONSTRAINT "FK_${schema}_e8219166186ce5e87c543183b0f" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_comments" ADD CONSTRAINT "FK_${schema}_614c064fdec99b33bf6dac1c3a1" FOREIGN KEY ("task") REFERENCES "${schema}"."datacube_task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_comments" ADD CONSTRAINT "FK_${schema}_c5c0b44ee811f352d70ca11fd64" FOREIGN KEY ("task_question") REFERENCES "${schema}"."task_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_comments" ADD CONSTRAINT "FK_${schema}_cc630fe69dad38976941e47bc56" FOREIGN KEY ("commented_by") REFERENCES "${schema}"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD CONSTRAINT "FK_${schema}_a1fb67f30a1e659fe84000facb7" FOREIGN KEY ("task_question") REFERENCES "${schema}"."task_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" ADD CONSTRAINT "FK_${schema}_f243c5fdb9fe82be83671b2e804" FOREIGN KEY ("datacube_question") REFERENCES "${schema}"."datacube_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_questions" ADD CONSTRAINT "FK_${schema}_a43832cc0c35d9a87d667ad6a97" FOREIGN KEY ("task") REFERENCES "${schema}"."datacube_task"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_questions" ADD CONSTRAINT "FK_${schema}_93dde680bd3ff30d519f06cebe8" FOREIGN KEY ("question_sequence") REFERENCES "${schema}"."datacube_question_sequences"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_sequences" ADD CONSTRAINT "FK_${schema}_c4ccd847158c195f1215ad74a2c" FOREIGN KEY ("group_question_rule") REFERENCES "${schema}"."datacube_group_questions_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_sequences" ADD CONSTRAINT "FK_${schema}_6d8a778762335a9d1a1616f7d7e" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_sequences" ADD CONSTRAINT "FK_${schema}_3ad64f30ffdebaab731af33ef2a" FOREIGN KEY ("datacube_question") REFERENCES "${schema}"."datacube_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_config" ADD CONSTRAINT "FK_${schema}_2540564f065cbd8623ef5c59788" FOREIGN KEY ("datacube_id") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" ADD CONSTRAINT "FK_${schema}_a1315cf308115e7ea6670acc582" FOREIGN KEY ("datacube") REFERENCES "${schema}"."datacube"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" ADD CONSTRAINT "FK_${schema}_f797172445a31062c50fc745151" FOREIGN KEY ("datacube_config") REFERENCES "${schema}"."datacube_config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" ADD CONSTRAINT "FK_${schema}_f02f929503fbb6196889ccbb173" FOREIGN KEY ("datacube_frequency") REFERENCES "${schema}"."datacube_frequency"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" ADD CONSTRAINT "FK_${schema}_6606957fce64270fe61d18b203c" FOREIGN KEY ("site") REFERENCES "${schema}"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" ADD CONSTRAINT "FK_${schema}_93f171c191140e59c4667199035" FOREIGN KEY ("data_provider") REFERENCES "${schema}"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" ADD CONSTRAINT "FK_${schema}_e04b84e8076dae1ec494ae3673a" FOREIGN KEY ("data_reviewer") REFERENCES "${schema}"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."sites" ADD CONSTRAINT "FK_${schema}_c49a714d5893b8ad2d2ee29d85b" FOREIGN KEY ("business_unit") REFERENCES "${schema}"."business_unit"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."role_access" ADD CONSTRAINT "FK_${schema}_1278f8804c82c7c7136339b458e" FOREIGN KEY ("role") REFERENCES "${schema}"."roles"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;
    await queryRunner.query(
      `ALTER TABLE "${schema}"."role_access" DROP CONSTRAINT "FK_${schema}_1278f8804c82c7c7136339b458e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."sites" DROP CONSTRAINT "FK_${schema}_c49a714d5893b8ad2d2ee29d85b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" DROP CONSTRAINT "FK_${schema}_e04b84e8076dae1ec494ae3673a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" DROP CONSTRAINT "FK_${schema}_93f171c191140e59c4667199035"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" DROP CONSTRAINT "FK_${schema}_6606957fce64270fe61d18b203c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_task" DROP CONSTRAINT "FK_${schema}_f02f929503fbb6196889ccbb173"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" DROP CONSTRAINT "FK_${schema}_f797172445a31062c50fc745151"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_frequency" DROP CONSTRAINT "FK_${schema}_a1315cf308115e7ea6670acc582"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_config" DROP CONSTRAINT "FK_${schema}_2540564f065cbd8623ef5c59788"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_sequences" DROP CONSTRAINT "FK_${schema}_3ad64f30ffdebaab731af33ef2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_sequences" DROP CONSTRAINT "FK_${schema}_6d8a778762335a9d1a1616f7d7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_sequences" DROP CONSTRAINT "FK_${schema}_c4ccd847158c195f1215ad74a2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_questions" DROP CONSTRAINT "FK_${schema}_93dde680bd3ff30d519f06cebe8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_questions" DROP CONSTRAINT "FK_${schema}_a43832cc0c35d9a87d667ad6a97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP CONSTRAINT "FK_${schema}_f243c5fdb9fe82be83671b2e804"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_question_answers" DROP CONSTRAINT "FK_${schema}_a1fb67f30a1e659fe84000facb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_comments" DROP CONSTRAINT "FK_${schema}_cc630fe69dad38976941e47bc56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_comments" DROP CONSTRAINT "FK_${schema}_c5c0b44ee811f352d70ca11fd64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."task_comments" DROP CONSTRAINT "FK_${schema}_614c064fdec99b33bf6dac1c3a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions_rules" DROP CONSTRAINT "FK_${schema}_e8219166186ce5e87c543183b0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions" DROP CONSTRAINT "FK_${schema}_72c25848b4c1b67eba462bdbf8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions" DROP CONSTRAINT "FK_${schema}_5eee2022d44ef692fc2d113927f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_group_questions" DROP CONSTRAINT "FK_${schema}_20bb0cd63af9923d07b353ea2dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_questions" DROP CONSTRAINT "FK_${schema}_76c4492b4bec66dfed784de5d01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_options" DROP CONSTRAINT "FK_${schema}_3fe239b0db8a6af2d8162041316"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_options" DROP CONSTRAINT "FK_${schema}_4655fac0969a805c73ec725639c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" DROP CONSTRAINT "FK_${schema}_bd758fe4b530c4e4a16a56c934e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" DROP CONSTRAINT "FK_${schema}_eaa3b50f8da89a069440b15b23a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" DROP CONSTRAINT "FK_${schema}_c5b46f9484ea98410b01d86422a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_question_rules" DROP CONSTRAINT "FK_${schema}_9a6e81b1097978fc75c895dd628"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_mixed_type_questions" DROP CONSTRAINT "FK_${schema}_753b5f6f89b2d955cf6be3129e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."datacube_mixed_type_questions" DROP CONSTRAINT "FK_${schema}_418a97dd617396633bc9f48824e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."business_unit" DROP CONSTRAINT "FK_${schema}_431b62d5283622ee10073e7b4e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."account" DROP CONSTRAINT "FK_${schema}_8fc20d11bc8a878e337ec9fda5b"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."report_templates"`);
    await queryRunner.query(`DROP TABLE "${schema}"."jobs"`);
    await queryRunner.query(`DROP TYPE "${schema}"."jobs_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "${schema}"."IDX_${schema}_b6fcaaf9d000472b2d6e6c8b38"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."role_access"`);
    await queryRunner.query(`DROP TABLE "${schema}"."roles"`);
    await queryRunner.query(`DROP TABLE "${schema}"."sites"`);
    await queryRunner.query(
      `DROP INDEX "${schema}"."datacube_task_datacube_frequency_site_idx"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."datacube_task"`);
    await queryRunner.query(`DROP TABLE "${schema}"."datacube_frequency"`);
    await queryRunner.query(`DROP TABLE "${schema}"."datacube"`);
    await queryRunner.query(`DROP TABLE "${schema}"."datacube_config"`);
    await queryRunner.query(
      `DROP INDEX "${schema}"."IDX_${schema}_b90371bc0ad896f18011ecbeef"`,
    );
    await queryRunner.query(
      `DROP TABLE "${schema}"."datacube_question_sequences"`,
    );
    await queryRunner.query(
      `DROP INDEX "${schema}"."task_questions_task_question_sequence_idx"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."task_questions"`);
    await queryRunner.query(`DROP TABLE "${schema}"."task_question_answers"`);
    await queryRunner.query(`DROP TABLE "${schema}"."task_comments"`);
    await queryRunner.query(
      `DROP TABLE "${schema}"."datacube_group_questions_rules"`,
    );
    await queryRunner.query(
      `DROP TABLE "${schema}"."datacube_group_questions"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."datacube_questions"`);
    await queryRunner.query(
      `DROP TABLE "${schema}"."datacube_question_options"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."datacube_question_rules"`);
    await queryRunner.query(
      `DROP INDEX "${schema}"."IDX_${schema}_mixed_type_id"`,
    );
    await queryRunner.query(
      `DROP TABLE "${schema}"."datacube_mixed_type_questions"`,
    );
    await queryRunner.query(
      `DROP INDEX "${schema}"."IDX_${schema}_BUSINESS_UNITS"`,
    );
    await queryRunner.query(`DROP TABLE "${schema}"."business_unit"`);
    await queryRunner.query(`DROP TABLE "${schema}"."account"`);
    await queryRunner.query(`DROP TABLE "${schema}"."user"`);
  }
}
