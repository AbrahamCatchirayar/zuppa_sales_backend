/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable consistent-return */

import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Question } from '../questions/question.entity';

@Entity({ name: 'master_subindicators' })
@Index('IDX_subindicator_name', ['name'])
export class SubIndicator extends AbstractEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  is_required: boolean;

  @OneToMany(() => Question, (question) => question.sub_indicator, {
    nullable: true,
  })
  questions: Question[];
}
