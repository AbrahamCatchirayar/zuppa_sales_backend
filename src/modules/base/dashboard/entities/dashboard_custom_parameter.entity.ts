import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { DashboardCombinedParameter } from './dashboard_combined_parameter.entity';
import { Dashboard } from './dashboard.entity';

@Entity('dashboard_custom_parameters')
export class DashboardCustomParameter extends AbstractEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ name: 'dashboard_custom_parameter_sequence', nullable: true })
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

  // ---------------- DashboardCombinedParameter relation ----------------
  @ManyToOne(
    () => DashboardCombinedParameter,
    (dashboardCombinedParameter) =>
      dashboardCombinedParameter.dashboard_custom_parameters,
    {
      onDelete: 'CASCADE',
      cascade: true,
    },
  )
  @JoinColumn({ name: 'dashboard_combined_parameter_id' })
  dashboard_combined_parameter: DashboardCombinedParameter;

  // ---------------- Dashboard relation ----------------
  @Column({ type: 'uuid', nullable: true })
  dashboard_id: string;

  @ManyToOne(() => Dashboard, (dashboard) => dashboard.customParameters, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'dashboard_id' })
  dashboard: Dashboard;
}
