import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StandardTemplate } from './standard_template.entity';

@Entity('standard_template_questions')
export class StandardTemplateQuestion extends AbstractEntity {
  @Column()
  question_title: string;

  @Column('text', { array: true, nullable: true })
  standard_questions: string[];

  @Column({ nullable: true })
  macro_function: string;

  @Column({ nullable: true })
  consolidated_answer: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  emission_value: string;

  @Column({ nullable: true })
  is_previous_year: boolean;

  @Column({ nullable: true })
  is_prior_year: boolean;

  @ManyToOne(() => StandardTemplate, (template) => template.id, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'standard_template_id' })
  standard_template: StandardTemplate;
}
