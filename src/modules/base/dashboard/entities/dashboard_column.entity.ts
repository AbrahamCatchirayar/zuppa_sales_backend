import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { DashboardBlock } from './dashboard_block.entity';
import { DashboardType } from './dashboard_type.entity';

@Entity('dashboard_columns')
export class DashboardColumn extends AbstractEntity {
  @ManyToOne(
    () => DashboardBlock,
    (dashboardBlock) => dashboardBlock.dashboard_columns,
    {
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @JoinColumn({ name: 'dashboard_block_id' })
  dashboard_block: DashboardBlock;

  @Column()
  sequence: number;

  @Column()
  number_of_items: number;

  @OneToMany(
    () => DashboardType,
    (dashboardType) => dashboardType.dashboard_column,
  )
  dashboard_types: DashboardType[];
}
