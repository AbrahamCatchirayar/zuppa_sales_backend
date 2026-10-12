import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Standard } from 'src/modules/base/standards/standard.entity';
import { StandardIndicator } from '../standard_indicators/standard_indicator.entity';
import { Module } from '../../masters/modules/module.entity';
import { Widget } from '../../widgets/entities/widget.entity';

@Entity({ name: 'standard_modules' })
export class StandardModule extends AbstractEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  sequence: number;

  @ManyToOne(() => Standard, (standard) => standard.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @OneToMany(() => StandardIndicator, (indicator) => indicator.standard_modules)
  standard_indicators: StandardIndicator[];

  @ManyToOne(() => Module, (module) => module.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'master_module_id' })
  master_module: Module;

  @OneToMany(() => Widget, (widget) => widget.module)
  widgets: Widget[];
}
