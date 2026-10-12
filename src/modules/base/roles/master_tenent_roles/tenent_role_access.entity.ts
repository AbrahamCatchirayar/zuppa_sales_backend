import { AbstractEntityAdmin } from 'src/utils/abstract.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { MasterRole } from './tenent_role.entity';

@Entity({ name: 'master_role_access' })
@Index(['role', 'module'], { unique: true })
export class MasterRoleAccess extends AbstractEntityAdmin {
  @Column('text', { array: true, default: [] })
  features: string[];

  @Column({ nullable: false })
  module: string;

  @ManyToOne(() => MasterRole, (role) => role.name, { cascade: true })
  @JoinColumn({ name: 'role' })
  role: MasterRole;
}
