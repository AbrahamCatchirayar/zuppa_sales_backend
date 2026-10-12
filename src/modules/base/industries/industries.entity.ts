/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable consistent-return */

import { getStatusValue } from 'src/utils';
import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  AfterLoad,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Sectors } from '../sectors/sectors.entity';

@Entity({ name: 'industries' })
@Index('IDX_industry_name', ['name', 'id'])
export class Industries extends AbstractEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  is_required: boolean;

  @ManyToOne(() => Sectors, (sector) => sector.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sector' })
  sector: Sectors;

  status: string;

  @AfterLoad()
  async sectorfuntion() {
    this.status = getStatusValue(this, 'industry');
  }
}
