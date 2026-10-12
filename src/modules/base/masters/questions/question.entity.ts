import { QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { QuestionOption } from './question_option.entity';
import { Indicator } from '../indicators/indicator.entity';
import { SubIndicator } from '../sub-indicators/sub-indicator.entity';
import { MixedTypeQuestion } from './mixed_type_question.entity';
import { Department } from '../departments/department.entity';

@Entity({ name: 'master_questions' })
@Unique(['title', 'indicator', 'sub_indicator'])
export class Question extends AbstractEntity {
  @Column({ nullable: true, unique: true })
  universal_question_id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'TEXT', enum: QuestionType })
  question_type: string;

  @Column({ nullable: true })
  placeholder: string;

  @Column({ default: false })
  is_latest_data: boolean;

  @ManyToOne(() => Indicator, (indicator) => indicator.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'indicator' })
  indicator: Indicator;

  @OneToMany(() => QuestionOption, (questionOption) => questionOption.question)
  question_options: QuestionOption[];

  @OneToMany(() => MixedTypeQuestion, (mixedType) => mixedType.question)
  mixed_type_questions: MixedTypeQuestion[];

  @ManyToOne(() => SubIndicator, (subIndicator) => subIndicator.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'sub_indicator' })
  sub_indicator: SubIndicator;

  @ManyToOne(() => Department, (department) => department.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department' })
  department: Department;
}
