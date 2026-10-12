import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { CustomItem } from './item.entity';
import { CustomParameter } from './custom_parameter.entity';

@Entity('custom_combined_parameters')
export class CustomCombinedParameter extends AbstractEntity {
  @Column({ name: 'sequence' })
  sequence: number;

  @ManyToOne(() => CustomItem, (item) => item.combinedParameters,
    {
      cascade: true,
      onDelete: 'CASCADE',
      nullable: true,
  })
  @JoinColumn({ name: 'custom_item_id' })
  customItem: CustomItem;

  @OneToMany(
    () => CustomParameter,
    (parameter) => parameter.customCombinedParameter,
  )
  customParameters: CustomParameter[];
}
