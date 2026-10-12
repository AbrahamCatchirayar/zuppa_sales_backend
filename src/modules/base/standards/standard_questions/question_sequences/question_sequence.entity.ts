import { QuestableType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { StandardIndicator } from '../../standard_indicators/standard_indicator.entity';
import { QuestionRules } from './question_rules/question_rule.entity';
import { StandardQuestion } from '../standard_question.entity';
import { GroupQuestions } from '../group_questions/group_question.entity';

@Entity({ name: 'question_sequences' })
export class QuestionSequences extends AbstractEntity {
  @Column()
  sequence: number;

  @Column()
  is_dependent: boolean;

  @Column({ enum: QuestableType })
  questable_type: string;

  @Column()
  universal_question_id: string;

  @OneToOne(() => StandardQuestion, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'standard_question_id' })
  standard_question_id: StandardQuestion;

  @OneToOne(() => GroupQuestions, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'group_questions' })
  group_questions: GroupQuestions;

  @ManyToOne(
    () => StandardIndicator,
    (standardIndicator) => standardIndicator.id,
    {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'standard_indicator_id' })
  standard_indicators: StandardIndicator;

  @OneToMany(
    () => QuestionRules,
    (questionRules) => questionRules.dependent_question_sequence_id,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'question_rules_id' })
  question_rules: QuestionRules[];
}
