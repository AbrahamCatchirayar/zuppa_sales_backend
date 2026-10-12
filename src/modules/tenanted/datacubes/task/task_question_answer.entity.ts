import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DataCubeGroupQuestionsRule } from '../questions/group_questions/group_question.entity';
import { DataCubeGroupQuestions } from '../questions/group_questions/group_question_sequence.entity';
import { DataCubeMixedTypeQuestion } from '../questions/mixed_questions/mixed_question.entity';
import { DataCubeQuestion } from '../questions/question.entity';
import { DataCubeQuestionOption } from '../questions/question_options/question_option.entity';
import { DataCubeQuestionRules } from '../questions/question_sequences/question_rules/question_rule.entity';
import { TaskQuestion } from './task_questions.entity';

@Entity({ name: 'task_question_answers' })
@Index(['task_question', 'datacube_question', 'universal_question_id'], {
  unique: true,
})
export class TaskQuestionAnswer extends AbstractEntity {
  @ManyToOne(() => TaskQuestion, (taskQuestion) => taskQuestion.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_question' })
  task_question: TaskQuestion;

  @ManyToOne(() => DataCubeQuestion, (question) => question.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube_question' })
  datacube_question: DataCubeQuestion;

  @Column('jsonb', { nullable: true })
  answer: string | string[];

  @Column()
  universal_question_id: string;

  @Column({ nullable: true })
  question_sequence_type: string;

  @Column({ nullable: true })
  index: number;

  @ManyToOne(() => DataCubeQuestionOption, (option) => option.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_option_id' })
  parent_option_id: DataCubeQuestionOption;

  @ManyToOne(
    () => DataCubeMixedTypeQuestion,
    (mixedQuestion) => mixedQuestion.id,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'mixed_question_id' })
  mixed_question_id: DataCubeMixedTypeQuestion;

  @ManyToOne(() => DataCubeQuestionRules, (rule) => rule.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rule_question_id' })
  rule_question_id: DataCubeQuestionRules;

  @ManyToOne(() => DataCubeGroupQuestionsRule, (groupRule) => groupRule.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_questions_rule_id' })
  group_questions_rule_id: DataCubeGroupQuestionsRule;
}
