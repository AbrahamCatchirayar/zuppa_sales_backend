import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Widget } from './widget.entity';
import { WidgetItem } from './widget_item.entity';
import { ChartType, Type } from '../widget.dto';
import { WidgetColumn } from './widget_column.entity';

@Entity('widget_types')
export class WidgetType extends AbstractEntity {
  @Column({ enum: Type })
  type: string;

  @Column({ enum: ChartType, nullable: true })
  chart_type: string;

  @Column({ nullable: true, default: false })
  is_stacked: boolean;

  @Column({ nullable: true, default: false })
  is_time_series: boolean;

  @Column({ nullable: true, default: false })
  is_horizontal: boolean;

  @Column({ nullable: true, default: false })
  is_metric: boolean;

  @Column({ nullable: true, default: false })
  latest_data: boolean;

  @ManyToOne(() => WidgetColumn, (column) => column.widget_types, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'widget_column_id' })
  widget_column: WidgetColumn;

  @ManyToOne(() => Widget, (widget) => widget.widget_type, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'widget_id' })
  widget: Widget;

  @OneToMany(() => WidgetItem, (item) => item.widget_type)
  widget_item: WidgetItem[];
}
