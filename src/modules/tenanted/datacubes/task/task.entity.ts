import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Site } from '../../sites/sites.entity';
import { BusinessUnit } from '../../businessunit/businessunit.entity';
import { User } from '../../user/entities/user.entity';
import { DataCubeFrequency } from '../datacube_frequency.entity';
import { TaskQuestion } from './task_questions.entity';

export enum TaskStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  REASSIGNED = 'REASSIGNED',
  COMPLETED = 'COMPLETED',
  REVIEWING = 'REVIEWING',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'datacube_task' })
@Index('datacube_task_datacube_frequency_site_idx', [
  'datacube_frequency',
  'site',
])
export class DataCubeTask extends AbstractEntity {
  @ManyToOne(() => DataCubeFrequency, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube_frequency' })
  datacube_frequency: DataCubeFrequency;

  @ManyToOne(() => Site, (site) => site.tasks, {
    cascade: true,
  })
  @JoinColumn({ name: 'site' })
  site: Site;

  @ManyToOne(() => BusinessUnit, (businessUnit) => businessUnit.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'business_unit' })
  business_unit: BusinessUnit;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'data_provider' })
  data_provider: User;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'data_reviewer' })
  data_reviewer: User;

  @Column({ nullable: true, enum: TaskStatus })
  status: string;

  @OneToMany(() => TaskQuestion, (taskQuestion) => taskQuestion.task)
  task_questions: TaskQuestion[];

  @Column({ type: 'text', nullable: true })
  template_task_file_url: string; // Template for individual task

  @Column({ type: 'text', nullable: true })
  template_yearly_file_url: string; // Yearly template

  // 🔹 Uploaded answer sheets
  @Column({ type: 'text', nullable: true })
  uploaded_task_file_url: string; // Uploaded Excel per task

  @Column({ type: 'text', nullable: true })
  uploaded_yearly_file_url: string; // Uploaded yearly sheet
}
