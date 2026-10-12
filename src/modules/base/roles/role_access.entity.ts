import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminRole } from './role.entity';

@Entity('admin_role_access')
export class AdminRoleAccess {
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

  @Column('text', { array: true, default: [] })
  features: string[];

  @Column({ nullable: false })
  module: string;

  @ManyToOne(() => AdminRole, (role) => role.name, { cascade: true })
  @JoinColumn({ name: 'role' })
  role: AdminRole;
}
