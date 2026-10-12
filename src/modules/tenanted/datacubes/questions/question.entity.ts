import { OptionsType, QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Datacube } from '../datacube.entity';
import { DataCubeMixedTypeQuestion } from './mixed_questions/mixed_question.entity';
import { DataCubeQuestionOption } from './question_options/question_option.entity';
import { TaskQuestionAnswer } from '../task/task_question_answer.entity';

@Entity({ name: 'datacube_questions' })
export class DataCubeQuestion extends AbstractEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'TEXT' })
  question_type: string;

  @Column({ nullable: true })
  placeholder: string;

  @Column({ nullable: true })
  sub_indicator_id: string;

  @Column({ nullable: true })
  sub_indicator_name: string;

  @Column({ nullable: true })
  department_id: string;

  @Column({ nullable: true })
  department_name: string;

  @Column({ enum: OptionsType })
  option_type: string;

  @Column()
  universal_question_id: string;

  @Column({ default: false })
  is_latest_data: boolean;

  @OneToMany(() => DataCubeQuestionOption, (option) => option.question, {
    nullable: true,
  })
  datacube_question_options: DataCubeQuestionOption[];

  @OneToMany(
    () => DataCubeMixedTypeQuestion,
    (mixedQuestion) => mixedQuestion.question,
    { nullable: true },
  )
  mixed_questions: DataCubeMixedTypeQuestion[];

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;

  @Column({ nullable: true })
  public_question_id: string;

  @OneToMany(
    () => TaskQuestionAnswer,
    (taskQuestionAnswer) => taskQuestionAnswer.datacube_question,
  )
  task_question_answers: TaskQuestionAnswer[];
}
