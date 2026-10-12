import { MigrationInterface, QueryRunner } from 'typeorm';

export class Admin1751434598157 implements MigrationInterface {
  name = 'Admin1751434598157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "admin_roles" ("name" character varying NOT NULL, CONSTRAINT "PK_6e9e938900168e4a0786bb65889" PRIMARY KEY ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_type" character varying, "created_by" character varying, "refresh_token" character varying, "email" character varying NOT NULL, "phone_number" character varying, "password" character varying, "first_name" character varying, "last_name" character varying, "status" character varying, "confirmed_at" TIMESTAMP, "invitation_token" character varying, "password_reset_on" TIMESTAMP, "invitation_token_sent_at" TIMESTAMP, "accept_terms_of_service" boolean NOT NULL DEFAULT false, "forget_password_token" character varying, "forget_password_token_sent_at" TIMESTAMP, "avatar_url" character varying, "blocked_reason" character varying, "blocked_on" TIMESTAMP, "created_by_user" uuid, "role" character varying, CONSTRAINT "UQ_ede7b295021b5dfef1e54a8d78f" UNIQUE ("refresh_token"), CONSTRAINT "UQ_840ac5cd67be99efa5cd989bf9f" UNIQUE ("email"), CONSTRAINT "UQ_4f07e46894d7985001b8421d439" UNIQUE ("forget_password_token"), CONSTRAINT "PK_a28028ba709cd7e5053a86857b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_601387af2beafe20a3fe1b6b44b" UNIQUE ("name"), CONSTRAINT "PK_357faa6421e1129bebed1eabc10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_module_name" ON "master_modules" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "mixed_type_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "value_question_type" character varying NOT NULL, "value_name" character varying NOT NULL, "value_enum" text array, "unit_name" character varying NOT NULL, "unit_type" character varying NOT NULL, "unit_enum" text array, "question" uuid, CONSTRAINT "PK_e43e8af1f659d210d3110b3eb06" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mixed_type_id" ON "mixed_type_questions" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "question_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "text" character varying, "value" character varying, "question" uuid, "mixed_type_question" uuid, CONSTRAINT "PK_13be20e51c0738def32f00cf7d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_subindicators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "is_required" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_59a7ef1b7845cb9134211c101e7" UNIQUE ("name"), CONSTRAINT "PK_c3ee4b9681f388fa664451721bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subindicator_name" ON "master_subindicators" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_custom_parameters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying, "questions" text array, "universal_questions" text array, "macro_function" character varying, "answer" text array, "unit" character varying, "legends" text array, "label" text array, "dashboard_combined_parameter_id" uuid, CONSTRAINT "PK_7d0357eab11e52e92d3c42880c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_combined_parameters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying, "dashboard_item_id" uuid, CONSTRAINT "PK_fc5bafc570517886923a6ffa920" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "dashboard_type_id" uuid, CONSTRAINT "PK_b3507850085460e1e9187543033" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "type" character varying NOT NULL, "chart_type" character varying, "is_stacked" boolean DEFAULT false, "is_horizontal" boolean DEFAULT false, "is_metric" boolean DEFAULT false, "dashboard_column_id" uuid, CONSTRAINT "PK_70d713928d51ca8f603d95d1c03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_columns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "number_of_items" integer NOT NULL, "dashboard_block_id" uuid, CONSTRAINT "PK_697cb047b4d791c829161d80666" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "number_of_columns" integer NOT NULL, "dashboard_tab_id" uuid, CONSTRAINT "PK_64f5b11bb0010f76d2fbfdf596f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboard_tabs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "number_of_blocks" integer NOT NULL, "sequence" integer NOT NULL, "dashboard_id" uuid, CONSTRAINT "PK_8996b9ac28fc7da551f69e6b236" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dashboards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "sequence" integer NOT NULL, "number_of_tabs" integer, "department_id" uuid, CONSTRAINT "PK_1b4b4bc346118e0d335f16c5344" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_question_sequences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "is_dependent" boolean NOT NULL DEFAULT false, "universal_question_id" character varying NOT NULL, "group_questions" uuid, "standard_question" uuid, CONSTRAINT "PK_5f92d482044ade79d3849f8140a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "is_multiple" boolean NOT NULL, "name" character varying NOT NULL, "max_limit" integer NOT NULL, "group_rule" jsonb, CONSTRAINT "PK_08ff51e997dfe4b45900fdd27ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_sequences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "is_dependent" boolean NOT NULL, "questable_type" character varying NOT NULL, "universal_question_id" character varying NOT NULL, "standard_question_id" uuid, "group_questions" uuid, "standard_indicator_id" uuid, CONSTRAINT "REL_3e13bce3effcda5bfc64f498ac" UNIQUE ("standard_question_id"), CONSTRAINT "REL_fcf5d7d7d60be963e91ef2b766" UNIQUE ("group_questions"), CONSTRAINT "PK_d3f8ecaa4890515c782c8096892" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "universal_question_id" character varying NOT NULL, "dependent_question_sequence_id" uuid, "parent_question_id" uuid, "parent_option_id" uuid, CONSTRAINT "PK_b3eb6ce2d48107adc3aaac0f7c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "standard_question_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "text" character varying, "value" character varying, "standard_question_id" uuid, "master_option_id" uuid, CONSTRAINT "PK_167b26acbe13c832e4d0ce36f39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "standard_mixed_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "value_question_type" character varying NOT NULL, "value_name" character varying NOT NULL, "value_enum" text array, "unit_name" character varying NOT NULL, "unit_type" character varying NOT NULL, "unit_enum" text array, "standard_question" uuid, CONSTRAINT "PK_3560fc1415b3f69da329c55dba0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "standard_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "description" character varying, "question_type" character varying NOT NULL DEFAULT 'TEXT', "placeholder" character varying, "option_type" character varying NOT NULL, "universal_question_id" character varying NOT NULL, "is_added_sequence" boolean NOT NULL DEFAULT false, "standard_indicator_id" uuid, "master_question_id" uuid, "sub_indicator_id" uuid, "department_id" uuid, CONSTRAINT "PK_d0352190615ff99e4d92b2ea986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_parameter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying, "questions" text array, "universal_questions" text array, "macro_function" character varying, "answer" text array, "unit" character varying, "legends" text array, "label" text array, "combined_parameter_id" uuid, CONSTRAINT "PK_298600c9a49b6969becf84c4367" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "combined_parameter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying, "widget_item_id" uuid, CONSTRAINT "PK_acbaf661a516716dfbe03bdd8fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "widget_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "filter" text array NOT NULL, "widget_id" uuid, "widget_type_id" uuid, CONSTRAINT "PK_288300e53e9c2b898449db6256b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "widget_blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "number_of_columns" integer NOT NULL, "sequence" integer NOT NULL, "widget_id" uuid, CONSTRAINT "PK_7f2bba7e2d6cfebd090e687c53e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "widget_columns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "widget_block_id" uuid, CONSTRAINT "PK_1f93c3a2a04d8c4badaf92a7d89" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "widget_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "type" character varying NOT NULL, "chart_type" character varying, "is_stacked" boolean DEFAULT false, "is_horizontal" boolean DEFAULT false, "is_metric" boolean DEFAULT false, "widget_column_id" uuid, "widget_id" uuid, CONSTRAINT "PK_19a59ae7df24f4aaf5bba3d11b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "widgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "sequence" integer NOT NULL, "number_of_blocks" integer NOT NULL, "module_id" uuid, "indicator_id" uuid, "department_id" uuid, CONSTRAINT "PK_da23136dbcfc91424451e24b725" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "universal_question_id" character varying, "title" character varying NOT NULL, "description" character varying, "question_type" character varying NOT NULL DEFAULT 'TEXT', "placeholder" character varying, "indicator" uuid, "sub_indicator" uuid, "department" uuid, CONSTRAINT "UQ_ad2dbcedbfd1289f0ed275eb56d" UNIQUE ("universal_question_id"), CONSTRAINT "UQ_0b4f85426e7bd66f3bf68fb10df" UNIQUE ("title", "indicator", "sub_indicator"), CONSTRAINT "PK_6bf53a5f239605dd11573d35da3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_indicators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "module_id" uuid, CONSTRAINT "UQ_081634a2ff58fe10101568b3a1b" UNIQUE ("name"), CONSTRAINT "PK_939087b9d0ea0e4faf489f1810d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "standard_indicators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "sequence" integer, "description" character varying, "standard_modules_id" uuid, "master_indicator_id" uuid, CONSTRAINT "PK_abd5bf8ac647ad177cf0834959a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "standard_modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "sequence" integer, "standard_id" uuid, "master_module_id" uuid, CONSTRAINT "PK_13cbc4a06c4856597db2fc28e6c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "standard_template_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "question_title" character varying NOT NULL, "standard_questions" text array, "macro_function" character varying, "consolidated_answer" character varying, "unit" character varying, "emission_value" character varying, "standard_template_id" uuid, CONSTRAINT "PK_74474e1ccd82785a557ef666834" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "standard_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "standard_id" uuid, CONSTRAINT "REL_5e6722a75889394ab724a4c7f7" UNIQUE ("standard_id"), CONSTRAINT "PK_7ddf9aaa6b47892ad252701f4f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_standards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "logo_url" character varying, "is_active" boolean, CONSTRAINT "UQ_30bc3e1cb3fcfac245879190edc" UNIQUE ("name"), CONSTRAINT "PK_9c98463f2d0eaa6ca2e47e961d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "industries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "is_required" boolean NOT NULL DEFAULT false, "sector" uuid, CONSTRAINT "UQ_447df075c342af02a92901dc810" UNIQUE ("name"), CONSTRAINT "PK_f1626dcb2d58142d7dfcca7b8d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_industry_name" ON "industries" ("name", "id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "UQ_1a10b192342e5165948f4dccefc" UNIQUE ("name"), CONSTRAINT "PK_923fdda0dc12f59add7b3a1782f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sector_name" ON "sectors" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "admin_role_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_type" character varying, "created_by" character varying, "features" text array NOT NULL DEFAULT '{}', "module" character varying NOT NULL, "role" character varying, CONSTRAINT "PK_e8ad0692b4fa923f1f004612ac8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "account_name" character varying NOT NULL, "slug" character varying NOT NULL, "email" character varying NOT NULL, "website_url" character varying, "official_email_id" character varying, "phone_number" character varying, "api_key" character varying, "tax_id" character varying, "address" character varying, "status" character varying, "time_frame" character varying, "invitation_sent_at" TIMESTAMP, "invitation_token" character varying, "confirmed_at" TIMESTAMP, "blocked_reason" character varying, "suspended_reason" character varying, "deleted_reason" character varying, "deleted_by" character varying, "suspended_on" TIMESTAMP, "blocked_on" TIMESTAMP, "sectors" text array, "industries" text array, "standards" text array, "created_by" uuid, "reviewed_by" uuid, "suspended_by" uuid, CONSTRAINT "UQ_8b34de5a32962513b79adb2e53a" UNIQUE ("slug"), CONSTRAINT "UQ_6cc32506d3dd866adb36a2bd542" UNIQUE ("invitation_sent_at"), CONSTRAINT "UQ_50bd8a6c6e3de9c1c685e1ac85d" UNIQUE ("invitation_token"), CONSTRAINT "PK_fff5fe91f5c27b6172116b0f169" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_roles" ("name" character varying NOT NULL, CONSTRAINT "PK_22491d95ea9946d9701b146bd24" PRIMARY KEY ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "master_role_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by_type" character varying, "created_by" character varying, "features" text array NOT NULL DEFAULT '{}', "module" character varying NOT NULL, "role" character varying, CONSTRAINT "PK_69cbe7c7cf3305751022b538754" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_551d5f5567116cbf3f213aa7a0" ON "master_role_access" ("role", "module") `,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_user" ADD CONSTRAINT "FK_5865650fb8e6d3b9d17460e8d0a" FOREIGN KEY ("created_by_user") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_user" ADD CONSTRAINT "FK_faa5e69338cb413df6d4e4926b3" FOREIGN KEY ("role") REFERENCES "admin_roles"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mixed_type_questions" ADD CONSTRAINT "FK_b3c52f0c5e3bebaf3bfbc42de15" FOREIGN KEY ("question") REFERENCES "master_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_options" ADD CONSTRAINT "FK_d909da67280e5a6421c2b9a6b0f" FOREIGN KEY ("question") REFERENCES "master_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_options" ADD CONSTRAINT "FK_c52e72b4254f10cb9b614dab871" FOREIGN KEY ("mixed_type_question") REFERENCES "mixed_type_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" ADD CONSTRAINT "FK_3e5f2f890c228321ac8e24a9792" FOREIGN KEY ("dashboard_combined_parameter_id") REFERENCES "dashboard_combined_parameters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_combined_parameters" ADD CONSTRAINT "FK_3012c1a4733c06eedb225459ac7" FOREIGN KEY ("dashboard_item_id") REFERENCES "dashboard_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_items" ADD CONSTRAINT "FK_e1b409b3ea5047b9157172d2618" FOREIGN KEY ("dashboard_type_id") REFERENCES "dashboard_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_types" ADD CONSTRAINT "FK_8f5ce4c744abb869240a963bc4d" FOREIGN KEY ("dashboard_column_id") REFERENCES "dashboard_columns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_columns" ADD CONSTRAINT "FK_950e99b132bd9d176b2035d0ba6" FOREIGN KEY ("dashboard_block_id") REFERENCES "dashboard_blocks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_blocks" ADD CONSTRAINT "FK_7d6235390bea877d7c2ae208f64" FOREIGN KEY ("dashboard_tab_id") REFERENCES "dashboard_tabs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_tabs" ADD CONSTRAINT "FK_d6555bdbe4a0765bf9ee401b024" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboards" ADD CONSTRAINT "FK_f08a36548c07f33fc0a4ae74a87" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" ADD CONSTRAINT "FK_6c3ee0987ce84e4509b55843ba5" FOREIGN KEY ("group_questions") REFERENCES "group_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" ADD CONSTRAINT "FK_c38587f07d37c34327f61e6c2f2" FOREIGN KEY ("standard_question") REFERENCES "standard_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_sequences" ADD CONSTRAINT "FK_3e13bce3effcda5bfc64f498ac5" FOREIGN KEY ("standard_question_id") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_sequences" ADD CONSTRAINT "FK_fcf5d7d7d60be963e91ef2b7663" FOREIGN KEY ("group_questions") REFERENCES "group_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_sequences" ADD CONSTRAINT "FK_216829c62b55a9ab0765a147be4" FOREIGN KEY ("standard_indicator_id") REFERENCES "standard_indicators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_5996206d3067a0f7960a9d19c30" FOREIGN KEY ("dependent_question_sequence_id") REFERENCES "question_sequences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_adfbf26ee98813070fe7414e8c6" FOREIGN KEY ("parent_question_id") REFERENCES "standard_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" ADD CONSTRAINT "FK_f162fe2ad6b27eb8ab59d1625ce" FOREIGN KEY ("parent_option_id") REFERENCES "standard_question_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" ADD CONSTRAINT "FK_809a48025a552732c04784712eb" FOREIGN KEY ("standard_question_id") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" ADD CONSTRAINT "FK_a0f59b169c2ba1c0e026aee4f44" FOREIGN KEY ("master_option_id") REFERENCES "question_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_mixed_questions" ADD CONSTRAINT "FK_a7e77622ee057994573361b6cca" FOREIGN KEY ("standard_question") REFERENCES "standard_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" ADD CONSTRAINT "FK_9ea069e2b373ff73c169a67f628" FOREIGN KEY ("standard_indicator_id") REFERENCES "standard_indicators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" ADD CONSTRAINT "FK_cf456cc925f3ea4b26bc94af43f" FOREIGN KEY ("master_question_id") REFERENCES "master_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" ADD CONSTRAINT "FK_f0d341d921c041b63cf0b6935c2" FOREIGN KEY ("sub_indicator_id") REFERENCES "master_subindicators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" ADD CONSTRAINT "FK_047d5df1c7475b052ec1a096a59" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_parameter" ADD CONSTRAINT "FK_f9784d14e379d2fd75e08dfc69e" FOREIGN KEY ("combined_parameter_id") REFERENCES "combined_parameter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "combined_parameter" ADD CONSTRAINT "FK_dbe5e6b20d805c298e4edd2133d" FOREIGN KEY ("widget_item_id") REFERENCES "widget_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_items" ADD CONSTRAINT "FK_5ee2fb72d708bd90a00191433bf" FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_items" ADD CONSTRAINT "FK_8401be93eea7fe25fdf59757c9d" FOREIGN KEY ("widget_type_id") REFERENCES "widget_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_blocks" ADD CONSTRAINT "FK_f4d1f4d395229eab4586e58a008" FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_columns" ADD CONSTRAINT "FK_4414db0f467d42d1b2b7f74e478" FOREIGN KEY ("widget_block_id") REFERENCES "widget_blocks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_types" ADD CONSTRAINT "FK_ce3801750d3cadd5fbc8e19a47d" FOREIGN KEY ("widget_column_id") REFERENCES "widget_columns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_types" ADD CONSTRAINT "FK_537a0865862e79f1f47cd13e781" FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widgets" ADD CONSTRAINT "FK_3a648c989cf5548d2579a81210b" FOREIGN KEY ("module_id") REFERENCES "standard_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widgets" ADD CONSTRAINT "FK_b82bba9ce87578b95eed207f1f5" FOREIGN KEY ("indicator_id") REFERENCES "standard_indicators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "widgets" ADD CONSTRAINT "FK_e8a1042cee7299de1362790a68b" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_questions" ADD CONSTRAINT "FK_70ba1023b6b0c2dbc1ef52777c5" FOREIGN KEY ("indicator") REFERENCES "master_indicators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_questions" ADD CONSTRAINT "FK_bad0a1b8558c92430f809dee87b" FOREIGN KEY ("sub_indicator") REFERENCES "master_subindicators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_questions" ADD CONSTRAINT "FK_f9ceca0e162ba7ede3f17774416" FOREIGN KEY ("department") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_indicators" ADD CONSTRAINT "FK_1ecece3d10321f2a6386a31de54" FOREIGN KEY ("module_id") REFERENCES "master_modules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_indicators" ADD CONSTRAINT "FK_ca83b905fbd6ea1a46ca3ba2260" FOREIGN KEY ("standard_modules_id") REFERENCES "standard_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_indicators" ADD CONSTRAINT "FK_53e98a9b947788ce4658c5a81c3" FOREIGN KEY ("master_indicator_id") REFERENCES "master_indicators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_modules" ADD CONSTRAINT "FK_d8470c469085a066cab784b5480" FOREIGN KEY ("standard_id") REFERENCES "master_standards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_modules" ADD CONSTRAINT "FK_60ad450d642296d7d8936bf7f1d" FOREIGN KEY ("master_module_id") REFERENCES "master_modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_template_questions" ADD CONSTRAINT "FK_5c21efab45d65be7242570a0238" FOREIGN KEY ("standard_template_id") REFERENCES "standard_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_templates" ADD CONSTRAINT "FK_5e6722a75889394ab724a4c7f7a" FOREIGN KEY ("standard_id") REFERENCES "master_standards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "industries" ADD CONSTRAINT "FK_361b6df73809cf2a9a37d14fd8f" FOREIGN KEY ("sector") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_role_access" ADD CONSTRAINT "FK_63522f88b9324f8757f9b296409" FOREIGN KEY ("role") REFERENCES "admin_roles"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_account" ADD CONSTRAINT "FK_1d7f24e2cf20db9b7bfadafd6ab" FOREIGN KEY ("created_by") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_account" ADD CONSTRAINT "FK_256a7ac8a3bec99cefc6b1db535" FOREIGN KEY ("reviewed_by") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_account" ADD CONSTRAINT "FK_b56bac2d45af6ab604866126a3f" FOREIGN KEY ("suspended_by") REFERENCES "admin_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_role_access" ADD CONSTRAINT "FK_a53e0666efc910ead9549a6d9dc" FOREIGN KEY ("role") REFERENCES "master_roles"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_role_access" DROP CONSTRAINT "FK_a53e0666efc910ead9549a6d9dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_account" DROP CONSTRAINT "FK_b56bac2d45af6ab604866126a3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_account" DROP CONSTRAINT "FK_256a7ac8a3bec99cefc6b1db535"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_account" DROP CONSTRAINT "FK_1d7f24e2cf20db9b7bfadafd6ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_role_access" DROP CONSTRAINT "FK_63522f88b9324f8757f9b296409"`,
    );
    await queryRunner.query(
      `ALTER TABLE "industries" DROP CONSTRAINT "FK_361b6df73809cf2a9a37d14fd8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_templates" DROP CONSTRAINT "FK_5e6722a75889394ab724a4c7f7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_template_questions" DROP CONSTRAINT "FK_5c21efab45d65be7242570a0238"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_modules" DROP CONSTRAINT "FK_60ad450d642296d7d8936bf7f1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_modules" DROP CONSTRAINT "FK_d8470c469085a066cab784b5480"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_indicators" DROP CONSTRAINT "FK_53e98a9b947788ce4658c5a81c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_indicators" DROP CONSTRAINT "FK_ca83b905fbd6ea1a46ca3ba2260"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_indicators" DROP CONSTRAINT "FK_1ecece3d10321f2a6386a31de54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_questions" DROP CONSTRAINT "FK_f9ceca0e162ba7ede3f17774416"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_questions" DROP CONSTRAINT "FK_bad0a1b8558c92430f809dee87b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_questions" DROP CONSTRAINT "FK_70ba1023b6b0c2dbc1ef52777c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widgets" DROP CONSTRAINT "FK_e8a1042cee7299de1362790a68b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widgets" DROP CONSTRAINT "FK_b82bba9ce87578b95eed207f1f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widgets" DROP CONSTRAINT "FK_3a648c989cf5548d2579a81210b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_types" DROP CONSTRAINT "FK_537a0865862e79f1f47cd13e781"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_types" DROP CONSTRAINT "FK_ce3801750d3cadd5fbc8e19a47d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_columns" DROP CONSTRAINT "FK_4414db0f467d42d1b2b7f74e478"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_blocks" DROP CONSTRAINT "FK_f4d1f4d395229eab4586e58a008"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_items" DROP CONSTRAINT "FK_8401be93eea7fe25fdf59757c9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "widget_items" DROP CONSTRAINT "FK_5ee2fb72d708bd90a00191433bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "combined_parameter" DROP CONSTRAINT "FK_dbe5e6b20d805c298e4edd2133d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_parameter" DROP CONSTRAINT "FK_f9784d14e379d2fd75e08dfc69e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" DROP CONSTRAINT "FK_047d5df1c7475b052ec1a096a59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" DROP CONSTRAINT "FK_f0d341d921c041b63cf0b6935c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" DROP CONSTRAINT "FK_cf456cc925f3ea4b26bc94af43f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_questions" DROP CONSTRAINT "FK_9ea069e2b373ff73c169a67f628"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_mixed_questions" DROP CONSTRAINT "FK_a7e77622ee057994573361b6cca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" DROP CONSTRAINT "FK_a0f59b169c2ba1c0e026aee4f44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standard_question_options" DROP CONSTRAINT "FK_809a48025a552732c04784712eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_f162fe2ad6b27eb8ab59d1625ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_adfbf26ee98813070fe7414e8c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_rules" DROP CONSTRAINT "FK_5996206d3067a0f7960a9d19c30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_sequences" DROP CONSTRAINT "FK_216829c62b55a9ab0765a147be4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_sequences" DROP CONSTRAINT "FK_fcf5d7d7d60be963e91ef2b7663"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_sequences" DROP CONSTRAINT "FK_3e13bce3effcda5bfc64f498ac5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" DROP CONSTRAINT "FK_c38587f07d37c34327f61e6c2f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_question_sequences" DROP CONSTRAINT "FK_6c3ee0987ce84e4509b55843ba5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboards" DROP CONSTRAINT "FK_f08a36548c07f33fc0a4ae74a87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_tabs" DROP CONSTRAINT "FK_d6555bdbe4a0765bf9ee401b024"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_blocks" DROP CONSTRAINT "FK_7d6235390bea877d7c2ae208f64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_columns" DROP CONSTRAINT "FK_950e99b132bd9d176b2035d0ba6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_types" DROP CONSTRAINT "FK_8f5ce4c744abb869240a963bc4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_items" DROP CONSTRAINT "FK_e1b409b3ea5047b9157172d2618"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_combined_parameters" DROP CONSTRAINT "FK_3012c1a4733c06eedb225459ac7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dashboard_custom_parameters" DROP CONSTRAINT "FK_3e5f2f890c228321ac8e24a9792"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_options" DROP CONSTRAINT "FK_c52e72b4254f10cb9b614dab871"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_options" DROP CONSTRAINT "FK_d909da67280e5a6421c2b9a6b0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mixed_type_questions" DROP CONSTRAINT "FK_b3c52f0c5e3bebaf3bfbc42de15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_user" DROP CONSTRAINT "FK_faa5e69338cb413df6d4e4926b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_user" DROP CONSTRAINT "FK_5865650fb8e6d3b9d17460e8d0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_551d5f5567116cbf3f213aa7a0"`,
    );
    await queryRunner.query(`DROP TABLE "master_role_access"`);
    await queryRunner.query(`DROP TABLE "master_roles"`);
    await queryRunner.query(`DROP TABLE "master_account"`);
    await queryRunner.query(`DROP TABLE "admin_role_access"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sector_name"`);
    await queryRunner.query(`DROP TABLE "sectors"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_industry_name"`);
    await queryRunner.query(`DROP TABLE "industries"`);
    await queryRunner.query(`DROP TABLE "master_standards"`);
    await queryRunner.query(`DROP TABLE "standard_templates"`);
    await queryRunner.query(`DROP TABLE "standard_template_questions"`);
    await queryRunner.query(`DROP TABLE "standard_modules"`);
    await queryRunner.query(`DROP TABLE "standard_indicators"`);
    await queryRunner.query(`DROP TABLE "master_indicators"`);
    await queryRunner.query(`DROP TABLE "master_questions"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TABLE "widgets"`);
    await queryRunner.query(`DROP TABLE "widget_types"`);
    await queryRunner.query(`DROP TABLE "widget_columns"`);
    await queryRunner.query(`DROP TABLE "widget_blocks"`);
    await queryRunner.query(`DROP TABLE "widget_items"`);
    await queryRunner.query(`DROP TABLE "combined_parameter"`);
    await queryRunner.query(`DROP TABLE "custom_parameter"`);
    await queryRunner.query(`DROP TABLE "standard_questions"`);
    await queryRunner.query(`DROP TABLE "standard_mixed_questions"`);
    await queryRunner.query(`DROP TABLE "standard_question_options"`);
    await queryRunner.query(`DROP TABLE "question_rules"`);
    await queryRunner.query(`DROP TABLE "question_sequences"`);
    await queryRunner.query(`DROP TABLE "group_questions"`);
    await queryRunner.query(`DROP TABLE "group_question_sequences"`);
    await queryRunner.query(`DROP TABLE "dashboards"`);
    await queryRunner.query(`DROP TABLE "dashboard_tabs"`);
    await queryRunner.query(`DROP TABLE "dashboard_blocks"`);
    await queryRunner.query(`DROP TABLE "dashboard_columns"`);
    await queryRunner.query(`DROP TABLE "dashboard_types"`);
    await queryRunner.query(`DROP TABLE "dashboard_items"`);
    await queryRunner.query(`DROP TABLE "dashboard_combined_parameters"`);
    await queryRunner.query(`DROP TABLE "dashboard_custom_parameters"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_subindicator_name"`);
    await queryRunner.query(`DROP TABLE "master_subindicators"`);
    await queryRunner.query(`DROP TABLE "question_options"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mixed_type_id"`);
    await queryRunner.query(`DROP TABLE "mixed_type_questions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_module_name"`);
    await queryRunner.query(`DROP TABLE "master_modules"`);
    await queryRunner.query(`DROP TABLE "admin_user"`);
    await queryRunner.query(`DROP TABLE "admin_roles"`);
  }
}
