/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { BusinessUnit } from '../businessunit/businessunit.entity';
import { User } from '../user/entities/user.entity';

@Entity({ name: 'account' })
export class Account extends AbstractEntity {
  @Column({ nullable: false })
  account_name: string;

  @Column({ nullable: false, unique: true })
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

  @Column({ default: 0 })
  current_onboarding_stage: number;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  logo_path: string;

  @ManyToOne(() => User, (user) => user.account)
  @JoinColumn({ name: 'user' })
  user: User;

  @Column('text', { array: true, nullable: true })
  sectors: string[];

  @Column('text', { array: true, nullable: true })
  industries: string[];

  @Column('text', { array: true, nullable: true })
  standards: string[];

  @OneToMany(() => BusinessUnit, (unit) => unit.account)
  business_unit: BusinessUnit[];

  // @OneToMany(() => Reports, (report) => report.account)
  // reports: Reports[];
}
