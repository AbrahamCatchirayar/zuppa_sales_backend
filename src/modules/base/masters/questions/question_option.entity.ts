import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MixedTypeQuestion } from './mixed_type_question.entity';
import { Question } from './question.entity';

@Entity({ name: 'question_options' })
export class QuestionOption extends AbstractEntity {
  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  value: string;

  @ManyToOne(() => Question, (question) => question.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'question' })
  question: Question;

  @ManyToOne(() => MixedTypeQuestion, (mixed) => mixed.id, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'mixed_type_question' })
  mixed_type_question: MixedTypeQuestion;
}
