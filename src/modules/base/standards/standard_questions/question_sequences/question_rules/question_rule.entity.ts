import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StandardQuestionOption } from '../../standard_question_options/standard_question_option.entity';
import { QuestionSequences } from '../question_sequence.entity';
import { StandardQuestion } from '../../standard_question.entity';

@Entity({ name: 'question_rules' })
export class QuestionRules extends AbstractEntity {
  @Column()
  universal_question_id: string;

  @ManyToOne(
    () => QuestionSequences,
    (questionSequences) => questionSequences.id,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'dependent_question_sequence_id' })
  dependent_question_sequence_id: QuestionSequences;

  @ManyToOne(
    () => StandardQuestion,
    (standardQuestion) => standardQuestion.id,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parent_question_id' })
  parent_question_id: StandardQuestion;

  @ManyToOne(
    () => StandardQuestionOption,
    (standardQuestionOption) => standardQuestionOption.id,
    {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parent_option_id' })
  parent_option_id: StandardQuestionOption;
}
