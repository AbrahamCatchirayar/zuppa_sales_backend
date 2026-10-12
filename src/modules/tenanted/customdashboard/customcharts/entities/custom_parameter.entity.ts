import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { CustomCombinedParameter } from './combined_parameter.entity';

@Entity('custom_parameters')
export class CustomParameter extends AbstractEntity {
  @Column({ name: 'sequence' })
  sequence: number;

  @Column('text', { array: true, nullable: true })
  questions: string[];

  @Column('text', { array: true, nullable: true })
  universal_questions: string[];

  @Column({ nullable: true })
  macro_function: string;

  @Column({ nullable: true })
  unit: string;

  @Column('text', { array: true, nullable: true })
  legends: string[];

  @Column('text', { array: true, nullable: true })
  label: string[];

  @Column({ type: 'text', nullable: true })
  custom_item_id: string;

  @Column('text', { array: true, nullable: true })
  answer: string[];

  @ManyToOne(
    () => CustomCombinedParameter,
    (combinedParameter) => combinedParameter.customParameters,
    {
      cascade: true,
      onDelete: 'CASCADE',
      nullable: true,
    }
  )
  @JoinColumn({ name: 'custom_combined_parameter_id' })
  customCombinedParameter: CustomCombinedParameter;
}
