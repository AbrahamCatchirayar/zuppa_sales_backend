import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { DashboardItem } from './dashboard_item.entity';
import { DashboardCustomParameter } from './dashboard_custom_parameter.entity';

@Entity('dashboard_combined_parameters')
export class DashboardCombinedParameter extends AbstractEntity {
  @Column({ nullable: true })
  name: string;

  @ManyToOne(
    () => DashboardItem,
    (dashboardItem) => dashboardItem.dashboard_combined_parameters,
    {
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @JoinColumn({ name: 'dashboard_item_id' })
  dashboard_item: DashboardItem;

  @OneToMany(
    () => DashboardCustomParameter,
    (dashboardCustomParameter) =>
      dashboardCustomParameter.dashboard_combined_parameter,
  )
  dashboard_custom_parameters: DashboardCustomParameter[];
}
