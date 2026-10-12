import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { DashboardType } from './dashboard_type.entity';
import { DashboardCombinedParameter } from './dashboard_combined_parameter.entity';
import { DashboardFilter } from './dashboard_filter.entity';

@Entity('dashboard_items')
export class DashboardItem extends AbstractEntity {
  @Column()
  title: string;

  @Column({ nullable: true, default: false })
  filter: boolean;

  @Column({ nullable: true, default: false })
  is_homepage_dashboard: boolean;

  @ManyToOne(
    () => DashboardType,
    (dashboardType) => dashboardType.dashboard_items,
    {
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @JoinColumn({ name: 'dashboard_type_id' })
  dashboard_type: DashboardType;

  @OneToMany(
    () => DashboardCombinedParameter,
    (dashboardCombinedParameter) => dashboardCombinedParameter.dashboard_item,
  )
  dashboard_combined_parameters: DashboardCombinedParameter[];

  @OneToMany(
    () => DashboardFilter,
    (dashboardFilter) => dashboardFilter.dashboard_item,
  )
  filters: DashboardFilter[];
}
