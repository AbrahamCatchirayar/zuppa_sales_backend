import { UUID } from 'crypto';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Dashboard } from '../../dashboard/entities/dashboard.entity';
import { StandardQuestion } from '../../standards/standard_questions/standard_question.entity';
import { Widget } from '../../widgets/entities/widget.entity';
import { Question } from '../questions/question.entity';

@Entity('departments')
export class Department extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  // @Column({ nullable: true })
  // description: string;

  @OneToMany(() => Question, (question) => question.department, {
    nullable: true,
  })
  questions: Question[];

  @OneToMany(
    () => StandardQuestion,
    (standardQuestion) => standardQuestion.department,
    {
      nullable: true,
    },
  )
  standardQuestions: StandardQuestion[];

  @OneToMany(() => Widget, (widget) => widget.department_id, {
    nullable: true,
  })
  widgets: Widget[];

  @OneToMany(() => Dashboard, (dashboard) => dashboard.department, {
    nullable: true,
  })
  dashboards: Dashboard[];
}
