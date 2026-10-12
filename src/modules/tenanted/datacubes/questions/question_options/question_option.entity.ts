import { QuestionOption } from 'src/modules/base/masters/questions/question_option.entity';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DataCubeQuestion } from '../question.entity';
import { DataCubeQuestionRules } from '../question_sequences/question_rules/question_rule.entity';
import { Datacube } from '../../datacube.entity';
import { TaskQuestionAnswer } from '../../task/task_question_answer.entity';

@Entity({ name: 'datacube_question_options' })
export class DataCubeQuestionOption extends AbstractEntity {
  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  placeholder: string;

  @ManyToOne(() => DataCubeQuestion, (question) => question.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'datacube_question_id' })
  question: DataCubeQuestion;

  @OneToMany(
    () => DataCubeQuestionRules,
    (questionRules) => questionRules.dependent_option_id,
    {
      nullable: true,
    },
  )
  question_rules: DataCubeQuestionRules[];

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;

  @Column({ nullable: true })
  public_question_option_id: string;

  @OneToMany(
    () => TaskQuestionAnswer,
    (taskQuestionAnswer) => taskQuestionAnswer.parent_option_id,
  )
  task_question_answers: TaskQuestionAnswer[];
}
