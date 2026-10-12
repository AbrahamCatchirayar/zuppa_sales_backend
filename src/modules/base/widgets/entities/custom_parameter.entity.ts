import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CombinedParameter } from './combined_parameter.entity';

@Entity()
export class CustomParameter extends AbstractEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ name: 'widget_custom_parameter_sequence', nullable: true })
  sequence: number;

  @Column('text', { array: true, nullable: true })
  questions: string[];

  @Column('text', { array: true, nullable: true })
  universal_questions: string[];

  @Column({ nullable: true })
  macro_function: string;

  @Column('text', { array: true, nullable: true })
  answer: string[];

  @Column({ nullable: true })
  unit: string;

  @Column('text', { array: true, nullable: true })
  legends: string[];

  @Column('text', { array: true, nullable: true })
  label: string[];

  @Column({ type: 'text', nullable: true })
  widget_id: string;

  @ManyToOne(
    () => CombinedParameter,
    (parameter) => parameter.custom_parameter,
    {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'combined_parameter_id' })
  combined_parameter: CombinedParameter;
}
