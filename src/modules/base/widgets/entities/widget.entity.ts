import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { WidgetType } from './widget_type.entity';
import { WidgetItem } from './widget_item.entity';
import { WidgetBlock } from './widget_block.entity';
import { StandardModule } from '../../standards/standard_modules/standard_module.entity';
import { StandardIndicator } from '../../standards/standard_indicators/standard_indicator.entity';
import { Department } from '../../masters/departments/department.entity';
import { Module } from '../../masters/modules/module.entity';
import { Indicator } from '../../masters/indicators/indicator.entity';

@Entity('widgets')
export class Widget extends AbstractEntity {
  @ManyToOne(() => StandardModule, (standardModule) => standardModule.widgets, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ManyToOne(() => StandardIndicator, (indicator) => indicator.widgets, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'indicator_id' })
  indicator: Indicator;

  @ManyToOne(() => Department, (department) => department.widgets, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department_id: Department;

  @Column()
  sequence: number;

  @Column()
  number_of_blocks: number;

  @OneToMany(() => WidgetType, (type) => type.widget)
  widget_type: WidgetType[];

  @OneToMany(() => WidgetItem, (item) => item.widget)
  widget_item: WidgetItem[];

  @OneToMany(() => WidgetBlock, (block) => block.widget)
  widget_blocks: WidgetBlock[];
}
