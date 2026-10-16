import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class CreateSalesJobOrders1770000000005 implements MigrationInterface {
  name = 'CreateSalesJobOrders1770000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."sales_job_orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "work_order_no" character varying NOT NULL,
        "purchase_order_number" character varying,
        "date_of_request" character varying,
        "requested_by" character varying,
        "customer_name" character varying NOT NULL,
        "contact_person" character varying,
        "contact_mobile" character varying,
        "customer_email" character varying,
        "customer_address" character varying,
        "target_delivery_date" character varying,
        "actual_delivery_date" character varying,
        "payment_status" character varying NOT NULL DEFAULT 'Pending',
        "order_type" character varying NOT NULL DEFAULT 'New',
        "pdf_attachment_url" character varying,
        "products_included" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "milestones" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "addons" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "internal_notes" text,
        "status" character varying NOT NULL DEFAULT 'Engineering Review',
        "status_item_count" character varying NOT NULL DEFAULT '1/1 ITEM',
        CONSTRAINT "PK_${schema}_sales_job_orders_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."sales_job_orders";`);
  }
}
