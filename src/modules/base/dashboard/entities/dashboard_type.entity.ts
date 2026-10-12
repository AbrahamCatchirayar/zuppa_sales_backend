import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { DashboardColumn } from './dashboard_column.entity';
import { ChartType, Type } from '../../widgets/widget.dto';
import { DashboardItem } from './dashboard_item.entity';

@Entity('dashboard_types')
export class DashboardType extends AbstractEntity {
  @Column({ enum: Type })
  type: string;

  @Column({ enum: ChartType, nullable: true })
  chart_type: string;

  @Column({ nullable: true, default: false })
  is_stacked: boolean;

  @Column({ nullable: true, default: false })
  is_horizontal: boolean;

  @Column({ nullable: true, default: false })
  is_metric: boolean;

  @Column({ nullable: true, default: false })
  is_time_series: boolean;

  @Column({ nullable: true, default: false })
  latest_data: boolean;

  @ManyToOne(
    () => DashboardColumn,
    (dashboardColumn) => dashboardColumn.dashboard_types,
    {
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @JoinColumn({ name: 'dashboard_column_id' })
  dashboard_column: DashboardColumn;

  @OneToMany(
    () => DashboardItem,
    (dashboardItem) => dashboardItem.dashboard_type,
  )
  dashboard_items: DashboardItem[];
}
