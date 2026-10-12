import { QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'mixed_type_questions' })
@Index('IDX_mixed_type_id', ['id'])
export class MixedTypeQuestion extends AbstractEntity {
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

  @ManyToOne(() => Question, (question) => question.id, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'question' })
  question: Question;
}
