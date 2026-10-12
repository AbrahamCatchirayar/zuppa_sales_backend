import { OptionsType, QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Question } from '../../masters/questions/question.entity';
import { StandardIndicator } from '../standard_indicators/standard_indicator.entity';
import { StandardQuestionOption } from './standard_question_options/standard_question_option.entity';
import { StandardMixedQuestions } from './standard_mixed_questions/standard_mixed_question.entity';
import { SubIndicator } from '../../masters/sub-indicators/sub-indicator.entity';
import { Department } from '../../masters/departments/department.entity';

@Entity({ name: 'standard_questions' })
export class StandardQuestion extends AbstractEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'TEXT', enum: QuestionType })
  question_type: string;

  @Column({ nullable: true })
  placeholder: string;

  @Column({ enum: OptionsType })
  option_type: string;

  @Column()
  universal_question_id: string;

  @Column({ default: false })
  is_latest_data: boolean;

  @OneToMany(
    () => StandardQuestionOption,
    (option) => option.standard_question,
    { nullable: true },
  )
  standard_question_options: StandardQuestionOption[];

  @OneToMany(
    () => StandardMixedQuestions,
    (mixedQuestion) => mixedQuestion.standard_question,
    { nullable: true },
  )
  mixed_questions: StandardMixedQuestions[];

  @ManyToOne(() => StandardIndicator, (indicator) => indicator.id, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'standard_indicator_id' })
  standard_indicator: StandardIndicator;

  @ManyToOne(() => Question, (masterQuestion) => masterQuestion.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'master_question_id' })
  master_question: Question;

  @ManyToOne(() => SubIndicator, (subIndicator) => subIndicator.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_indicator_id' })
  sub_indicator_id: SubIndicator;

  @ManyToOne(() => Department, (department) => department.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ default: false })
  is_added_sequence: boolean;
}
