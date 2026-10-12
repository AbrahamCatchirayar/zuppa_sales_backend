/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import * as bcrypt from 'bcryptjs';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Transform } from 'class-transformer';
import { UserStatus } from '../../tenanted/user/enums/tenentuser.enum';
import { AdminRole } from '../roles/role.entity';

@Entity({ name: 'admin_user' })
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    default: null,
  })
  created_by_type: string;

  @Column({
    default: null,
  })
  created_by: string;

  @Column({ nullable: true, unique: true })
  refresh_token: string;

  @ManyToOne(() => AdminUser, (admin) => admin.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_user' })
  created_by_user: AdminUser;

  created_by_info: any;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true, enum: UserStatus })
  status: string;

  @ManyToOne(() => AdminRole, (role) => role.name)
  @JoinColumn({ name: 'role' })
  @Transform(({ obj }) => {
    return obj.role.name;
  })
  role: string;

  @Column({ default: null })
  confirmed_at: Date;

  @Column({ default: null })
  invitation_token: string;

  @Column({ nullable: true })
  password_reset_on: Date;

  @Column({ nullable: true })
  invitation_token_sent_at: Date;

  @Column({ default: false })
  accept_terms_of_service: boolean;

  @Column({ nullable: true, unique: true })
  forget_password_token: string;

  @Column({ nullable: true })
  forget_password_token_sent_at: Date;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  blocked_reason: string;

  @Column({ nullable: true })
  blocked_on: Date;

  @BeforeInsert()
  async beforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.role === 'SUPERADMIN') {
      if (!this.invitation_token) {
        this.confirmed_at = new Date();
      }
    }
  }

  // @BeforeInsert()
  // firstName() {
  //   this.first_name =
  //     this.first_name?.charAt(0).toUpperCase() + this.first_name?.slice(1);
  // }
}
