/* eslint-disable @typescript-eslint/require-await */

import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { StandardModule } from './standard_modules/standard_module.entity';
import { StandardTemplate } from './standard_templates/standard_template.entity';
import { Dashboard } from '../dashboard/entities/dashboard.entity';

@Entity({ name: 'master_standards' })
export class Standard extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  is_active: boolean;

  @OneToMany(() => StandardModule, (standardModule) => standardModule.standard)
  standard_modules: StandardModule[];

  @OneToOne(
    () => StandardTemplate,
    (standardTemplate) => standardTemplate.standard,
  )
  standard_templates: StandardTemplate;

  @OneToMany(() => Dashboard, (dashboard) => dashboard.standard)
  dashboards: Dashboard[];
}
