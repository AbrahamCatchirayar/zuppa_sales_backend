import { AbstractEntity } from 'src/utils/abstract.entity';
import { Entity, Index, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StandardQuestion } from '../../standards/standard_questions/standard_question.entity';
import { WidgetItem } from './widget_item.entity';

@Entity({ name: 'widget_filters' })
@Index(['public_question'])
export class WidgetFiltersEntity extends AbstractEntity {
  @ManyToOne(() => StandardQuestion, (public_question) => public_question.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'public_question_id' })
  public_question: StandardQuestion;

  @Column({ nullable: true })
  universal_question_id: string;

  @Column({ nullable: true })
  is_option: boolean;

  @Column({ name: 'widget_filter_sequence', nullable: true })
  sequence: number;

  @ManyToOne(() => WidgetItem, (widget_item) => widget_item.filters, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'widget_item_id' })
  widget_item_id: WidgetItem;
}
