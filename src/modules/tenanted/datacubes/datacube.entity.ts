import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { DataCubeFrequency } from './datacube_frequency.entity';
import { DataCubeQuestionSequences } from './questions/question_sequences/question_sequence.entity';
import { DataCubeConfig } from './datacube_config.entity';
import { Disclosure } from '../disclosure/disclosure.entity';

export enum DatacubeStatus {
  CREATED = 'CREATED',
  SETUP = 'SETUP',
  DATA_COLLECTING = 'DATA_COLLECTING',
  REPORT_GENERATED = 'REPORT_GENERATED',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

export enum DatacubeFrequencyenum {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

@Entity({ name: 'datacube' })
export class Datacube extends AbstractEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, enum: DatacubeFrequencyenum })
  frequency: string;

  @Column({ nullable: true })
  financial_year: string;

  @Column({ nullable: true, enum: DatacubeStatus })
  status: string;

  @Column({ type: 'json', nullable: true })
  standards: Record<string, any>[];

  @OneToMany(
    () => DataCubeQuestionSequences,
    (datacubeqs) => datacubeqs.datacube,
  )
  datacube_question_sequences: DataCubeQuestionSequences[];

  @OneToMany(() => DataCubeFrequency, (frequency) => frequency.datacube)
  datacube_frequency: DataCubeFrequency[];

  @OneToOne(() => DataCubeConfig, (config) => config.datacube)
  datacube_config: DataCubeConfig;

  @OneToMany(() => Disclosure, (disclosure) => disclosure.datacube)
  disclosures: Disclosure[];
}
