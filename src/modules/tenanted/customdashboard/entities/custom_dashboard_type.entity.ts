import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomType } from '../customcharts/entities/type.entity';
import { CustomDashboardColumn } from './column.entity';

@Entity('custom_dashboard_type')
export class CustomDashboardType extends AbstractEntity {
  @Column({ type: 'uuid', nullable: true })
  widget_type_id: string;

  @Column({ type: 'uuid', nullable: true })
  dashboard_type_id: string;

  @ManyToOne(() => CustomDashboardColumn, (column) => column.types, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'custom_dashboard_column_id' })
  customDashboardColumn: CustomDashboardColumn;

  @ManyToOne(() => CustomType, (type) => type.customDashboardTypes, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'custom_type_id' })
  customType: CustomType;

  widgetParams?: any[];
  dashboardParams?: any[];
  customTypeParams?: any;
  widget_type_obj?: any;

  calculated?: any[];
}
