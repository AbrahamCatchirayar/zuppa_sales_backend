import { QuestableType, QuestionType } from 'src/enum/questiontype.enum';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Datacube } from '../datacubes/datacube.entity';

@Entity({ name: 'consolidated_responses' })
@Index('consolidated_response_index', ['datacube', 'universal_question_id'])
export class ConsolidatedResponse extends AbstractEntity {
  @Column({ nullable: false })
  consolidated_response: string;

  @Column({ nullable: false })
  question_type: QuestionType;

  @Column({ nullable: true })
  questable_type: QuestableType;

  @Column({ nullable: false })
  universal_question_id: string;

  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'datacube_id' })
  datacube: Datacube;
}
