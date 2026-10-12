import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Module } from '../modules/module.entity';
import { Question } from '../questions/question.entity';

@Entity({ name: 'master_indicators' })
export class Indicator extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Module, (module) => module.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @OneToMany(() => Question, (question) => question.indicator)
  questions: Question[];
}
