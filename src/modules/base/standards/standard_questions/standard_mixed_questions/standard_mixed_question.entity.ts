import { QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { StandardQuestion } from '../standard_question.entity';

@Entity({ name: 'standard_mixed_questions' })
export class StandardMixedQuestions extends AbstractEntity {
  @Column({ nullable: false, enum: QuestionType })
  value_question_type: string;

  @Column({ nullable: false })
  value_name: string;

  @Column('text', { nullable: true, array: true })
  value_enum: string[];

  @Column({ nullable: false })
  unit_name: string;

  @Column({ nullable: false, enum: QuestionType })
  unit_type: string;

  @Column('text', { nullable: true, array: true })
  unit_enum: string[];

  @ManyToOne(() => StandardQuestion, (question) => question.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'standard_question' })
  standard_question: StandardQuestion;
}
