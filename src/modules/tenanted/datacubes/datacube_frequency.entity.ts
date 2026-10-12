import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Datacube } from './datacube.entity';
import { DataCubeConfig } from './datacube_config.entity';
import { DataCubeTask } from './task/task.entity';

export enum DataCubeFrequencyStatus {
  CREATED = 'CREATED',
  INPROGRESS = 'INPROGRESS',
  COMPLETED = 'COMPLETED',
  DATA_COLLECTING = 'DATA_COLLECTING',
}

@Entity({ name: 'datacube_frequency' })
export class DataCubeFrequency extends AbstractEntity {
  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;

  @Column({ nullable: true })
  frequency_name: string;

  @Column({ nullable: true, default: 'CREATED', enum: DataCubeFrequencyStatus })
  status: string;

  @ManyToOne(() => DataCubeConfig, (config) => config.frequencies)
  @JoinColumn({ name: 'datacube_config' })
  datacube_config: DataCubeConfig;

  @OneToMany(
    () => DataCubeTask,
    (dataCubeTask) => dataCubeTask.datacube_frequency,
  )
  task: DataCubeTask[];
}
