import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { StandardQuestion } from '../standard_question.entity';
import { GroupQuestions } from './group_question.entity';

@Entity({ name: 'group_question_sequences' })
export class GroupQuestionSequences extends AbstractEntity {
  @Column({ default: false })
  is_dependent: boolean;

  @Column({ type: 'integer', default: 0 })
  group_sequence: number;

  @Column()
  universal_question_id: string;

  @ManyToOne(() => GroupQuestions, (grpQuestion) => grpQuestion.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_questions' })
  group_question: GroupQuestions;

  @ManyToOne(
    () => StandardQuestion,
    (standardQuestion) => standardQuestion.id,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'standard_question' })
  standard_question: StandardQuestion;
}
