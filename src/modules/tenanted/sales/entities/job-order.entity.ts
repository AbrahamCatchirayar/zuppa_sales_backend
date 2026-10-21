/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'sales_job_orders' })
export class JobOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  work_order_no: string;

  @Column({ type: 'varchar', nullable: true })
  purchase_order_number: string;

  @Column({ type: 'varchar', nullable: true })
  date_of_request: string;

  @Column({ type: 'varchar', nullable: true })
  requested_by: string;

  @Column({ type: 'varchar' })
  customer_name: string;

  @Column({ type: 'varchar', nullable: true })
  contact_person: string;

  @Column({ type: 'varchar', nullable: true })
  contact_mobile: string;

  @Column({ type: 'varchar', nullable: true })
  customer_email: string;

  @Column({ type: 'varchar', nullable: true })
  customer_address: string;

  @Column({ type: 'varchar', nullable: true })
  target_delivery_date: string;

  @Column({ type: 'varchar', nullable: true })
  actual_delivery_date: string;

  @Column({ type: 'varchar', default: 'Pending' })
  payment_status: string;

  @Column({ type: 'varchar', default: 'New' })
  order_type: string;

  @Column({ type: 'varchar', nullable: true })
  pdf_attachment_url: string;

  @Column({ type: 'jsonb', default: [] })
  products_included: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  milestones: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  addons: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  internal_notes: string;

  @Column({ type: 'varchar', default: 'Engineering Review' })
  status: string;

  @Column({ type: 'varchar', default: '1/1 ITEM' })
  status_item_count: string;

  @Column({ type: 'jsonb', default: {} })
  schedule_spec: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
