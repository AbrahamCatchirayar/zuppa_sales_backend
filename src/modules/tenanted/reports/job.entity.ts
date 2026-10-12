import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity } from 'typeorm';

export enum JobStatus {
  Pending = 'pending',
  Running = 'in progress',
  Completed = 'completed',
  Failed = 'failed',
}

@Entity({ name: 'jobs' })
export class Job extends AbstractEntity {
  @Column({ nullable: false })
  report_name: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.Pending })
  status: JobStatus;

  @Column()
  type: string;

  @Column({ nullable: true })
  report_url: string;
}
