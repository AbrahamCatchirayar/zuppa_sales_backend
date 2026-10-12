import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Department } from '../../masters/departments/department.entity';
import { DashboardTab } from './dashboard_tabs.entity';
import { DashboardCustomParameter } from './dashboard_custom_parameter.entity';
import { Standard } from '../../standards/standard.entity';

@Entity('dashboards')
export class Dashboard extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  sequence: number;

  @Column({ nullable: true })
  number_of_tabs: number;

  @ManyToOne(() => Department, (department) => department.dashboards, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Standard, (standard) => standard.dashboards, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'standard_id' })
  standard: Standard;

  @OneToMany(() => DashboardTab, (tab) => tab.dashboard)
  tabs: DashboardTab[];

  @OneToMany(
    () => DashboardCustomParameter,
    (customParam) => customParam.dashboard,
  )
  customParameters: DashboardCustomParameter[];
}
