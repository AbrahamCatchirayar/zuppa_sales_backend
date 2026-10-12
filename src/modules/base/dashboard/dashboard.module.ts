import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Standard } from 'src/modules/base/standards/standard.entity';
import { Dashboard } from './entities/dashboard.entity';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardType } from './entities/dashboard_type.entity';
import { DashboardBlock } from './entities/dashboard_block.entity';
import { DashboardTab } from './entities/dashboard_tabs.entity';
import { DashboardColumn } from './entities/dashboard_column.entity';
import { DashboardItem } from './entities/dashboard_item.entity';
import { DashboardCombinedParameter } from './entities/dashboard_combined_parameter.entity';
import { DashboardCustomParameter } from './entities/dashboard_custom_parameter.entity';
import { Department } from '../masters/departments/department.entity';
import { DashboardFilter } from './entities/dashboard_filter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dashboard,
      DashboardTab,
      DashboardBlock,
      DashboardColumn,
      DashboardType,
      DashboardItem,
      DashboardCombinedParameter,
      DashboardCustomParameter,
      Department,
      Standard,
      DashboardFilter,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
