import { AbstractEntity } from 'src/utils/abstract.entity';
import { ManyToOne, JoinColumn, Column, Entity } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DataCubeTask } from './task.entity';
import { TaskQuestion } from './task_questions.entity';

@Entity({ name: 'task_comments' })
export class TaskComments extends AbstractEntity {
  @ManyToOne(() => DataCubeTask, (task) => task.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task' })
  task: DataCubeTask;

  @ManyToOne(() => TaskQuestion, (task) => task.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_question' })
  task_question: TaskQuestion;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'commented_by' })
  commented_by: User;

  @Column({ nullable: true })
  comment: string;
}
