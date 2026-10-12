/* eslint-disable prettier/prettier */
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { Account } from '../account/account.entity';

@Entity({ name: 'business_unit' })
@Index('IDX_BUSINESS_UNITS', ['name'])
export class BusinessUnit extends AbstractEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @OneToMany(() => Site, (location) => location.business_unit)
  sites: Site[];

  @ManyToOne(() => Account, (account) => account.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({
    name: 'account'
  })
  account: Account;
}