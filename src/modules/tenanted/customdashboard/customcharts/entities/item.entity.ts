import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { CustomType } from './type.entity';
import { CustomCombinedParameter } from './combined_parameter.entity';

@Entity('custom_items')
export class CustomItem extends AbstractEntity {
  @Column()
  title: string;

  @ManyToOne(() => CustomType, (type) => type.customItems,
    {
      cascade: true,
      onDelete: 'CASCADE',
      nullable: true,
  })
  @JoinColumn({ name: 'custom_type_id' })
  customType: CustomType;

  @OneToMany(() => CustomCombinedParameter, (parameter) => parameter.customItem)
  combinedParameters: CustomCombinedParameter[];
}
