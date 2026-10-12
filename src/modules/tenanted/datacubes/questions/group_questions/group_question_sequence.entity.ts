import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { DataCubeGroupQuestionsRule } from './group_question.entity';
import { DataCubeQuestion } from '../question.entity';
import { Datacube } from '../../datacube.entity';

@Entity({ name: 'datacube_group_questions' })
export class DataCubeGroupQuestions extends AbstractEntity {
  @ManyToOne(
    () => DataCubeGroupQuestionsRule,
    (grpQuesRule) => grpQuesRule.id,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'group_questions_rule' })
  group_question_rule: DataCubeGroupQuestionsRule;

  @Column({ default: false })
  is_dependent: boolean;

  @Column()
  universal_question_id: string;

  // ADD THIS NEW COLUMN ⬇️
  @Column({ type: 'int4', nullable: true })
  group_sequence: number;

  @ManyToOne(
    () => DataCubeQuestion,
    (standardQuestion) => standardQuestion.id,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'datacube_question' })
  datacube_question: DataCubeQuestion;

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube' })
  datacube: Datacube;
}
