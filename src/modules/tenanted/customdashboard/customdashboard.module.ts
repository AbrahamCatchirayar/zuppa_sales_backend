import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetModule } from 'src/modules/base/widgets/widget.module';
import { DashboardModule } from 'src/modules/base/dashboard/dashboard.module';
import { WidgetType } from 'src/modules/base/widgets/entities/widget_type.entity';
import { DashboardType } from 'src/modules/base/dashboard/entities/dashboard_type.entity';
import { CustomDashboard } from './entities/custom_dashboard.entity';
import { CustomDashboardService } from './customdashboard.service';
import { CustomDashboardController } from './customdashboard.controller';
import { CustomDashboardColumn } from './entities/column.entity';
import { CustomDashboardBlock } from './entities/block.entity';
import { CustomDashboardType } from './entities/custom_dashboard_type.entity';
import { AuthModule } from '../auth/auth.module';
import { CustomType } from './customcharts/entities/type.entity';
import { CustomItem } from './customcharts/entities/item.entity';
import { CustomCombinedParameter } from './customcharts/entities/combined_parameter.entity';
import { CustomParameter } from './customcharts/entities/custom_parameter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomDashboard,
      CustomDashboardBlock,
      CustomDashboardColumn,
      CustomDashboardType,
      WidgetType,
      DashboardType,
      CustomType,
      CustomItem,
      CustomCombinedParameter,
      CustomParameter,
      WidgetType,
      DashboardType,
    ]),
    AuthModule,
    WidgetModule,
    DashboardModule,
  ],
  controllers: [CustomDashboardController],
  providers: [CustomDashboardService],
  exports: [CustomDashboardService],
})
export class CustomDashboardModule {}
