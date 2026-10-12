import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Dashboard } from './dashboard.entity';
import { DashboardBlock } from './dashboard_block.entity';

@Entity('dashboard_tabs')
export class DashboardTab extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  number_of_blocks: number;

  @Column()
  sequence: number;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.tabs, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'dashboard_id' })
  dashboard: Dashboard;

  @OneToMany(
    () => DashboardBlock,
    (dashboardBlock) => dashboardBlock.dashboard_tab,
  )
  dashboard_blocks: DashboardBlock[];
}
