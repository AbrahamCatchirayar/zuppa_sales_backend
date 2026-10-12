/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable consistent-return */

import { getStatusValue } from 'src/utils';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { AfterLoad, Column, Entity, Index, OneToMany } from 'typeorm';
import { Industries } from '../industries/industries.entity';

@Entity({ name: 'sectors' })
@Index('IDX_sector_name', ['name'])
export class Sectors extends AbstractEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @OneToMany(() => Industries, (industry) => industry.sector)
  industry: Industries[];

  status: string;

  @AfterLoad()
  async sectorfunction() {
    this.status = getStatusValue(this, 'sector');
  }
}
