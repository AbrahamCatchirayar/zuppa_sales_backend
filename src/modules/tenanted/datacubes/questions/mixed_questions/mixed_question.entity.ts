import { QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DataCubeQuestion } from '../question.entity';
import { Datacube } from '../../datacube.entity';
import { TaskQuestionAnswer } from '../../task/task_question_answer.entity';

@Entity({ name: 'datacube_mixed_type_questions' })
@Index('IDX_mixed_type_id', ['id'])
export class DataCubeMixedTypeQuestion extends AbstractEntity {
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

  @ManyToOne(() => DataCubeQuestion, (question) => question.id, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question' })
  question: DataCubeQuestion;

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;

  @OneToMany(
    () => TaskQuestionAnswer,
    (taskQuestionAnswer) => taskQuestionAnswer.mixed_question_id,
  )
  task_question_answers: TaskQuestionAnswer[];
}
