import { AbstractEntity } from 'src/utils/abstract.entity';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Datacube } from '../../../datacube.entity';
import { DataCubeQuestion } from '../../question.entity';
import { DataCubeQuestionOption } from '../../question_options/question_option.entity';
import { DataCubeQuestionSequences } from '../question_sequence.entity';
import { TaskQuestionAnswer } from '../../../task/task_question_answer.entity';

@Entity({ name: 'datacube_question_rules' })
export class DataCubeQuestionRules extends AbstractEntity {
  @ManyToOne(
    () => DataCubeQuestionSequences,
    (questionSequences) => questionSequences.id,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'question_sequence_id' })
  question_sequence_id: DataCubeQuestionSequences;

  @ManyToOne(
    () => DataCubeQuestion,
    (standardQuestion) => standardQuestion.id,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'dependent_question_id' })
  dependent_question_id: DataCubeQuestion;

  @ManyToOne(
    () => DataCubeQuestionOption,
    (standardQuestionOption) => standardQuestionOption.id,
    { nullable: true, cascade: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'dependent_option_id' })
  dependent_option_id: DataCubeQuestionOption;

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;

  @OneToMany(
    () => TaskQuestionAnswer,
    (taskQuestionAnswer) => taskQuestionAnswer.rule_question_id,
  )
  task_question_answers: TaskQuestionAnswer[];
}
