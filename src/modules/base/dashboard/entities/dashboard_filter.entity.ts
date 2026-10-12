import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DashboardItem } from './dashboard_item.entity';
import { StandardQuestion } from '../../standards/standard_questions/standard_question.entity';

@Entity('dashboard_filters')
@Index(['public_question'])
export class DashboardFilter extends AbstractEntity {
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

  @Column({ name: 'dashboard_filter_sequence', nullable: true })
  sequence: number;

  @ManyToOne(() => DashboardItem, (dashboardItem) => dashboardItem.filters, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'dashboard_item_id' })
  dashboard_item: DashboardItem;
}
