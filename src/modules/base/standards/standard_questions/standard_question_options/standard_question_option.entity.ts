import { QuestionOption } from 'src/modules/base/masters/questions/question_option.entity';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { StandardQuestion } from '../standard_question.entity';
import { QuestionRules } from '../question_sequences/question_rules/question_rule.entity';

@Entity({ name: 'standard_question_options' })
export class StandardQuestionOption extends AbstractEntity {
  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  value: string;

  @ManyToOne(() => StandardQuestion, (question) => question.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'standard_question_id' })
  standard_question: StandardQuestion;

  @ManyToOne(
    () => QuestionOption,
    (masterQuestionOption) => masterQuestionOption.id,
    {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'master_option_id' })
  master_option: QuestionOption;

  @OneToMany(
    () => QuestionRules,
    (questionRules) => questionRules.parent_option_id,
    {
      nullable: true,
    },
  )
  question_rules: QuestionRules[];
}
