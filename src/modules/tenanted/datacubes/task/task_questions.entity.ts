import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  AfterLoad,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { DataCubeQuestionSequences } from '../questions/question_sequences/question_sequence.entity';
import { DataCubeTask } from './task.entity';
import { TaskComments } from './task_comments.entity';
import { TaskQuestionAnswer } from './task_question_answer.entity';

@Entity({ name: 'task_questions' })
@Index('task_questions_task_question_sequence_idx', [
  'task',
  'question_sequence',
])
export class TaskQuestion extends AbstractEntity {
  @ManyToOne(() => DataCubeTask, (task) => task.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task' })
  task: DataCubeTask;

  @ManyToOne(() => DataCubeQuestionSequences, (question) => question.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_sequence' })
  question_sequence: DataCubeQuestionSequences;

  @Column()
  universal_question_id: string;

  @Column({ nullable: true })
  is_approved: boolean;

  @Column({ nullable: true, type: 'time without time zone' })
  approved_at: Date;

  @Column({ nullable: true })
  site: string;

  @Column({ nullable: true })
  datacube_frequency: string;

  @Column({ nullable: true })
  approved_by: string;

  @Column({ nullable: true, type: 'time without time zone' })
  data_provided_on: Date;

  @Column({ nullable: true })
  is_answered: boolean;

  @OneToMany(
    () => TaskQuestionAnswer,
    (taskQuestionAnswer) => taskQuestionAnswer.task_question,
  )
  task_question_answers: TaskQuestionAnswer[];

  @OneToMany(() => TaskComments, (taskComments) => taskComments.task_question)
  task_comments: TaskComments[];

  module_name: string;

  indicator_name: string;

  @AfterLoad()
  afterLoad() {
    if (this.question_sequence && this.question_sequence.public_module_name) {
      this.module_name = this.question_sequence.public_module_name;
      this.indicator_name = this.question_sequence.public_indicator_name;
    } else {
      this.module_name = null;
      this.indicator_name = null;
    }
  }
}
