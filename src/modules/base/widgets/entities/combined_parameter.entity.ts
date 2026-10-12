import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { CustomParameter } from './custom_parameter.entity';
import { WidgetItem } from './widget_item.entity';

@Entity()
export class CombinedParameter extends AbstractEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ name: 'widget_combined_parameter_sequence', nullable: true })
  sequence: number;

  @ManyToOne(
    () => WidgetItem,
    (widget_item) => widget_item.combined_parameters,
    {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'widget_item_id' })
  widget_item: WidgetItem;

  @OneToMany(
    () => CustomParameter,
    (custom_parameter) => custom_parameter.combined_parameter,
  )
  custom_parameter: CustomParameter[];
}
