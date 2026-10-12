import { QuestableType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { DataCubeQuestion } from '../question.entity';
import { Datacube } from '../../datacube.entity';
import { DataCubeQuestionRules } from './question_rules/question_rule.entity';
import { DataCubeGroupQuestionsRule } from '../group_questions/group_question.entity';
import { TaskQuestion } from '../../task/task_questions.entity';

@Entity({ name: 'datacube_question_sequences' })
@Index(['datacube', 'datacube_question'])
export class DataCubeQuestionSequences extends AbstractEntity {
  // reduce<T>(arg0: (acc: any, curr: any) => any, arg1: {}) {
  //   throw new Error('Method not implemented.');
  // }
  @Column()
  sequence: number;

  @Column()
  is_dependent: boolean;

  @Column({ enum: QuestableType })
  questable_type: string;

  @Column({ nullable: true })
  public_indicator_id: string;

  @Column({ nullable: true })
  public_indicator_name: string;

  @Column({ nullable: true })
  public_module_id: string;

  @Column({ nullable: true })
  public_module_name: string;

  @Column({ nullable: true })
  public_question_sequence_id: string;

  @Column()
  universal_question_id: string;

  @ManyToOne(() => DataCubeGroupQuestionsRule, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'group_question_rule' })
  group_question_rule: DataCubeGroupQuestionsRule;

  @OneToMany(
    () => DataCubeQuestionRules,
    (questionRules) => questionRules.question_sequence_id,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'question_rules_id' })
  question_rules_id: DataCubeQuestionRules[];

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;

  @ManyToOne(() => DataCubeQuestion, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'datacube_question' })
  datacube_question: DataCubeQuestion;

  @OneToMany(
    () => TaskQuestion,
    (taskQuestion) => taskQuestion.question_sequence,
    {
      nullable: true,
    },
  )
  task_question: TaskQuestion[];
}
