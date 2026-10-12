import { AbstractEntityAdmin } from 'src/utils/abstract.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'role_access' })
@Index(['role', 'module'], { unique: true })
export class RoleAccess extends AbstractEntityAdmin {
  @Column('text', { array: true, default: [] })
  features: string[];

  @Column({ nullable: false })
  module: string;

  @ManyToOne(() => Role, (role) => role.name, { cascade: true })
  @JoinColumn({ name: 'role' })
  role: Role;
}
