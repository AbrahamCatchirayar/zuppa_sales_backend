import { AbstractEntity } from 'src/utils/abstract.entity';
import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Standard } from '../standard.entity';
import { StandardTemplateQuestion } from './standard_template_questions.entity';

@Entity('standard_templates')
export class StandardTemplate extends AbstractEntity {
  @OneToOne(() => Standard, (standard) => standard.standard_templates, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @OneToMany(() => StandardTemplateQuestion, (stq) => stq.standard_template)
  standard_template_question: StandardTemplateQuestion[];
}
