import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { CustomDashboardBlock } from './block.entity';
import { CustomDashboardType } from './custom_dashboard_type.entity';

@Entity('custom_dashboard_column')
export class CustomDashboardColumn extends AbstractEntity {
  @Column()
  sequence: number;

  @ManyToOne(() => CustomDashboardBlock, (block) => block.columns,
    {
      cascade: true,
      onDelete: 'CASCADE',
      nullable: true,
  })
  @JoinColumn({ name: 'custom_dashboard_block_id' })
  customDashboardBlock: CustomDashboardBlock;

  @OneToMany(() => CustomDashboardType, (type) => type.customDashboardColumn)
  types: CustomDashboardType[];
}
