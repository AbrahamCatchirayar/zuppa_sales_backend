import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { DataCubeFrequency } from './datacube_frequency.entity';
import { Datacube } from './datacube.entity';

@Entity({ name: 'datacube_config' })
export class DataCubeConfig extends AbstractEntity {
  @Column({ nullable: false, type: 'timestamp without time zone' })
  start_date: Date;

  @Column({ nullable: false, type: 'timestamp without time zone' })
  end_date: Date;

  @OneToOne(() => Datacube, (datacube) => datacube.datacube_config, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube_id' })
  datacube: Datacube;

  @OneToMany(
    () => DataCubeFrequency,
    (frequency) => frequency.datacube_config,
    {
      cascade: true,
    },
  )
  frequencies: DataCubeFrequency[];
}
