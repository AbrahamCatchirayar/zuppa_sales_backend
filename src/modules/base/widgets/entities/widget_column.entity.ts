import { AbstractEntity } from 'src/utils/abstract.entity';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { WidgetBlock } from './widget_block.entity';
import { WidgetItem } from './widget_item.entity';
import { WidgetType } from './widget_type.entity';

@Entity('widget_columns')
export class WidgetColumn extends AbstractEntity {
  @Column()
  sequence: number;

  @ManyToOne(() => WidgetBlock, (block) => block.widget_columns, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'widget_block_id' })
  widget_block: WidgetBlock;

  @OneToMany(() => WidgetType, (type) => type.widget_column)
  widget_types: WidgetType[];
}
