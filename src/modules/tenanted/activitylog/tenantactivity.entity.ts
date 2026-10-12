import { ActivityType } from 'src/utils';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { DataCubeTask } from '../datacubes/task/task.entity';
import { Datacube } from '../datacubes/datacube.entity';

@Entity({ name: 'tenantactivitylog' })
export class TenantActivity extends AbstractEntity {
  @Column()
  activity_type: ActivityType;

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube_id' })
  datacube: Datacube;

  @ManyToOne(() => DataCubeTask, (task) => task.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'task_id' })
  task: DataCubeTask;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
