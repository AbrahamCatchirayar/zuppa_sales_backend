import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleModule } from '../modules/module.module';
import { Indicator } from './indicator.entity';
import { IndicatorService } from './indicator.service';
import { IndicatorsController } from './indicators.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Indicator]), ModuleModule],
  controllers: [IndicatorsController],
  providers: [IndicatorService],
  exports: [IndicatorService],
})
export class IndicatorModule {}
