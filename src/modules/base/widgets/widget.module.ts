import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { Widget } from './entities/widget.entity';
import { WidgetType } from './entities/widget_type.entity';
import { WidgetItem } from './entities/widget_item.entity';
import { WidgetBlock } from './entities/widget_block.entity';
import { WidgetColumn } from './entities/widget_column.entity';
import { Department } from '../masters/departments/department.entity';
import { CombinedParameter } from './entities/combined_parameter.entity';
import { CustomParameter } from './entities/custom_parameter.entity';
import { WidgetFiltersEntity } from './entities/widget_filter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Widget,
      WidgetType,
      WidgetItem,
      WidgetBlock,
      WidgetColumn,
      Department,
      WidgetFiltersEntity,
      CombinedParameter,
      CustomParameter,
    ]),
  ],
  controllers: [WidgetController],
  providers: [WidgetService],
  exports: [WidgetService],
})
export class WidgetModule {}
