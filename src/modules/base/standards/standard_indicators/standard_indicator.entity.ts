import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Indicator } from '../../masters/indicators/indicator.entity';
import { StandardModule } from '../standard_modules/standard_module.entity';
import { StandardQuestion } from '../standard_questions/standard_question.entity';
import { QuestionSequences } from '../standard_questions/question_sequences/question_sequence.entity';
import { Widget } from '../../widgets/entities/widget.entity';
import { StandardTemplateQuestion } from '../standard_templates/standard_template_questions.entity';

@Entity('standard_indicators')
export class StandardIndicator extends AbstractEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  sequence: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => StandardModule, (module) => module.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'standard_modules_id' })
  standard_modules: StandardModule;

  @OneToMany(() => StandardQuestion, (question) => question.standard_indicator)
  standard_questions: StandardQuestion[];

  @ManyToOne(() => Indicator, (indicator) => indicator.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'master_indicator_id' })
  master_indicator: Indicator;

  @OneToMany(
    () => QuestionSequences,
    (questionSequence) => questionSequence.standard_indicators,
    {
      nullable: true,
    },
  )
  question_sequences: QuestionSequences[];

  @OneToMany(() => Widget, (widget) => widget.indicator)
  widgets: Widget[];
}
