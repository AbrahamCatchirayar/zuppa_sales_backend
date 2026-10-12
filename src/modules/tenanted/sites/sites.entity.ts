import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BusinessUnit } from '../businessunit/businessunit.entity';
import { DataCubeTask } from '../datacubes/task/task.entity';

@Entity({ name: 'sites' })
export class Site extends AbstractEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  location: string;

  @ManyToOne(() => BusinessUnit, (unit) => unit.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_unit' })
  business_unit: BusinessUnit;

  @OneToMany(() => DataCubeTask, (task) => task.site)
  tasks: DataCubeTask[];
}
