import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { GroupQuestionSequences } from './group_question_sequence.entity';

@Entity({ name: 'group_questions' })
export class GroupQuestions extends AbstractEntity {
  @Column()
  is_multiple: boolean;

  @Column()
  name: string;

  @Column()
  max_limit: number;

  @Column({ type: 'jsonb', nullable: true })
  group_rule: Record<string, any>[];

  @OneToMany(
    () => GroupQuestionSequences,
    (groupQuestionSequences) => groupQuestionSequences.group_question,
  )
  group_question_sequences: GroupQuestionSequences[];
}
