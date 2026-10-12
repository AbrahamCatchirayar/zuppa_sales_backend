import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DashboardColumn } from './dashboard_column.entity';
import { DashboardTab } from './dashboard_tabs.entity';

@Entity('dashboard_blocks')
export class DashboardBlock extends AbstractEntity {
  @ManyToOne(
    () => DashboardTab,
    (dashboardTab) => dashboardTab.dashboard_blocks,
    {
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @JoinColumn({ name: 'dashboard_tab_id' })
  dashboard_tab: DashboardTab;

  @Column()
  sequence: number;

  @Column()
  number_of_columns: number;

  @OneToMany(
    () => DashboardColumn,
    (dashboardColumn) => dashboardColumn.dashboard_block,
  )
  dashboard_columns: DashboardColumn[];
}
