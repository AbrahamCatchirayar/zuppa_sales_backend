import { Entity, OneToMany, Column } from 'typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';

import { CustomDashboardBlock } from './block.entity';

@Entity('custom_dashboard')
export class CustomDashboard extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  number_of_blocks: number;

  @Column()
  sequence: number;

  @OneToMany(() => CustomDashboardBlock, (block) => block.customDashboard)
  blocks: CustomDashboardBlock[];
  // widget_items: import("d:/Prasanth/V2_Rubicr_coducer/rubicr_v2_backendservice/src/modules/base/widgets/entities/widget_item.entity").WidgetItem;
  // dashboard_items: import("d:/Prasanth/V2_Rubicr_coducer/rubicr_v2_backendservice/src/modules/base/dashboard/entities/dashboard_item.entity").DashboardItem;
}
