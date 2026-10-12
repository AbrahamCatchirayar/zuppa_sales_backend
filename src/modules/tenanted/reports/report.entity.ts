import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Datacube } from '../datacubes/datacube.entity';
import { JobStatus } from './job.entity';

@Entity({ name: 'report_templates' })
export class ReportTemplate extends AbstractEntity {
  @Column({ nullable: true, default: JobStatus.Pending })
  status: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  url: string;

  @Column({ nullable: false })
  report_name: string;

  @Column({ nullable: false })
  standard: string;

  @Column({ nullable: false })
  standard_id: string;

  @Column({ nullable: false })
  financial_year: string;

  // ✅ relation
  @ManyToOne(() => Datacube, (datacube) => datacube.id, {
    cascade: true,
    nullable: true, // Made nullable to handle existing data
  })
  @JoinColumn({ name: 'datacube_id' })
  datacube: Datacube;

  // ✅ expose the foreign key
  @RelationId((reportTemplate: ReportTemplate) => reportTemplate.datacube)
  datacube_id: string;
}
