import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Widget } from './widget.entity';
import { WidgetColumn } from './widget_column.entity';

@Entity('widget_blocks')
export class WidgetBlock extends AbstractEntity {
  @Column()
  number_of_columns: number;

  @Column()
  sequence: number;

  @ManyToOne(() => Widget, (widget) => widget.widget_blocks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'widget_id' })
  widget: Widget;

  @OneToMany(() => WidgetColumn, (column) => column.widget_block)
  widget_columns: WidgetColumn[];
}
