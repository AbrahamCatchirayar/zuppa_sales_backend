import { QuestableType, QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Datacube } from '../datacubes/datacube.entity';
import { DataCubeFrequency } from '../datacubes/datacube_frequency.entity';
import { DataCubeGroupQuestionsRule } from '../datacubes/questions/group_questions/group_question.entity';
import { DataCubeQuestionRules } from '../datacubes/questions/question_sequences/question_rules/question_rule.entity';
import { Site } from '../sites/sites.entity';

@Entity({ name: 'all_response' })
@Index('all_response_index', [
  'datacube',
  'universal_question_id',
  'site',
  'datacubefrequency',
])
export class AllResponse extends AbstractEntity {
  @Column({ nullable: false, enum: QuestionType })
  question_type: QuestionType;

  @Column({ nullable: true, enum: QuestableType })
  questable_type: QuestableType;

  @Column({ nullable: false })
  universal_question_id: string;

  @ManyToOne(
    () => DataCubeGroupQuestionsRule,
    (groupQuestionsRule) => groupQuestionsRule.id,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'group_questions_rule_id' })
  group_questions_rule_id: DataCubeGroupQuestionsRule;

  @ManyToOne(() => DataCubeQuestionRules, (rule) => rule.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rule_question_id' })
  rule_question_id: DataCubeQuestionRules;

  @Column({ nullable: false })
  answer: string;

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube_id' })
  datacube: Datacube;

  @ManyToOne(() => Site, (site) => site.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @ManyToOne(
    () => DataCubeFrequency,
    (datacubefrequency) => datacubefrequency.id,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'datacubefrequency_id' })
  datacubefrequency: DataCubeFrequency;
}
