import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardModule } from 'src/modules/base/dashboard/dashboard.module';
import { WidgetModule } from 'src/modules/base/widgets/widget.module';
import { AuthModule } from '../../auth/auth.module';
import { CustomChartsController } from './customcharts.controller';
import { CustomChartsService } from './customcharts.service';
import { CustomCombinedParameter } from './entities/combined_parameter.entity';
import { CustomParameter } from './entities/custom_parameter.entity';
import { CustomItem } from './entities/item.entity';
import { CustomType } from './entities/type.entity';
import { CustomDashboardModule } from '../customdashboard.module';
import { CustomDashboard } from '../entities/custom_dashboard.entity';
import { CustomDashboardBlock } from '../entities/block.entity';
import { CustomDashboardColumn } from '../entities/column.entity';
import { CustomDashboardType } from '../entities/custom_dashboard_type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomItem,
      CustomType,
      CustomCombinedParameter,
      CustomParameter,
      CustomDashboard,
      CustomDashboardBlock,
      CustomDashboardColumn,
      CustomDashboardType,
    ]),
    AuthModule,
    CustomDashboardModule,
  ],
  controllers: [CustomChartsController],
  providers: [CustomChartsService],
  exports: [CustomChartsService],
})
export class CustomChartModule {}
