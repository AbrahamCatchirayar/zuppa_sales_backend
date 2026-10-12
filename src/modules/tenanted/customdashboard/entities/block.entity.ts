import { Entity, JoinColumn, ManyToOne, OneToMany, Column } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';

import { CustomDashboard } from './custom_dashboard.entity';
import { CustomDashboardColumn } from './column.entity';

@Entity('custom_dashboard_block')
export class CustomDashboardBlock extends AbstractEntity {
  @Column()
  number_of_columns: number;

  @Column()
  sequence: number;

  @ManyToOne(() => CustomDashboard, (customDashboard) => customDashboard.blocks, {
      cascade: true,
      onDelete: 'CASCADE',
      nullable: true,
  })
  @JoinColumn({ name: 'custom_dashboard_id' })
  customDashboard: CustomDashboard;

  @OneToMany(
    () => CustomDashboardColumn,
    (column) => column.customDashboardBlock,
  )
  columns: CustomDashboardColumn[];
}
