import { AbstractEntity } from 'src/utils/abstract.entity';
import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Datacube } from '../datacubes/datacube.entity';
import { User } from '../user/entities/user.entity';

@Entity({ name: 'disclosures' })
@Index('IDX_DISCLOSURES', ['name'])
export class Disclosure extends AbstractEntity {
  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({
    name: 'datacube_id',
  })
  datacube: Datacube;

  @ManyToOne(() => User, (user) => user.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({
    name: 'submitted_by',
  })
  submitted_by: User;

  @Column({ type: 'json', nullable: true })
  indicators: Record<string, any>[];
}
