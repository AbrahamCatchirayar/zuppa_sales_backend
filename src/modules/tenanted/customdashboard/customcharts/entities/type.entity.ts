import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { ChartType, Type } from 'src/modules/base/widgets/widget.dto';
import { CustomItem } from './item.entity';
import { CustomDashboardType } from '../../entities/custom_dashboard_type.entity';

@Entity('custom_types')
export class CustomType extends AbstractEntity {
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

  @OneToMany(() => CustomItem, (chart) => chart.customType)
  customItems: CustomItem[];

  @OneToMany(() => CustomDashboardType, (type) => type.customType)
  customDashboardTypes: CustomDashboardType[];
}
