import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { AdminUser } from '../users/user.entity';

@Entity()
export class MasterAccount extends AbstractEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  account_name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  official_email_id: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  api_key: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  time_frame: string;

  @Column({ unique: true, nullable: true })
  invitation_sent_at: Date;

  @Column({ unique: true, nullable: true })
  invitation_token: string;

  @Column({ nullable: true })
  confirmed_at: Date;

  @Column({ nullable: true })
  blocked_reason: string;

  @Column({ nullable: true })
  suspended_reason: string;

  @Column({ nullable: true })
  deleted_reason: string;

  @Column({ nullable: true })
  deleted_by: string;

  @Column({ nullable: true })
  suspended_on: Date;

  @Column({ nullable: true })
  blocked_on: Date;

  @ManyToOne(() => AdminUser, (createdBy) => createdBy.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AdminUser;

  @ManyToOne(() => AdminUser, (admin) => admin.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'reviewed_by' })
  blocked_by: string;

  @ManyToOne(() => AdminUser, (admin) => admin.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'suspended_by' })
  suspended_by: string;

  @Column('text', { array: true, nullable: true })
  sectors: string[];

  @Column('text', { array: true, nullable: true })
  industries: string[];

  @Column('text', { array: true, nullable: true })
  standards: string[];
}
