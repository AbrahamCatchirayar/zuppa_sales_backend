import { AbstractEntity } from 'src/utils/abstract.entity';
import { Entity, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { CombinedParameter } from './combined_parameter.entity';
import { Widget } from './widget.entity';
import { WidgetFiltersEntity } from './widget_filter.entity';
import { WidgetType } from './widget_type.entity';

@Entity('widget_items')
export class WidgetItem extends AbstractEntity {
  @Column()
  title: string;

  @Column({ nullable: true, default: false })
  filter: boolean;

  @Column({ nullable: true, default: false })
  is_homepage_widget: boolean;

  @ManyToOne(() => Widget, (widget) => widget.widget_item, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'widget_id' })
  widget: Widget;

  @ManyToOne(() => WidgetType, (type) => type.widget_item, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'widget_type_id' })
  widget_type: WidgetType;

  @OneToMany(
    () => CombinedParameter,
    (combined_parameter) => combined_parameter.widget_item,
  )
  combined_parameters: CombinedParameter[];

  @OneToMany(() => WidgetFiltersEntity, (filter) => filter.widget_item_id)
  filters: WidgetFiltersEntity[];
}
