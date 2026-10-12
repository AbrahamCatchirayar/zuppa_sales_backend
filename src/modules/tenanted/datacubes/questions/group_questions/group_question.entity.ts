import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DataCubeGroupQuestions } from './group_question_sequence.entity';
import { Datacube } from '../../datacube.entity';
import { TaskQuestionAnswer } from '../../task/task_question_answer.entity';

@Entity({ name: 'datacube_group_questions_rules' })
export class DataCubeGroupQuestionsRule extends AbstractEntity {
  @Column()
  is_multiple: boolean;

  @Column()
  name: string;

  @Column()
  max_limit: number;

  @Column({ type: 'jsonb', nullable: true })
  group_rule: Record<string, any>[];

  @Column()
  public_group_id: string;

  @OneToMany(
    () => DataCubeGroupQuestions,
    (groupQuestions) => groupQuestions.group_question_rule,
  )
  datacube_group_questions: DataCubeGroupQuestions[];

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;

  @OneToMany(
    () => TaskQuestionAnswer,
    (taskQuestionAnswer) => taskQuestionAnswer.group_questions_rule_id,
  )
  task_question_answers: TaskQuestionAnswer[];
}
