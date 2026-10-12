import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandardIndicator } from './standard_indicator.entity';
import { StandardIndicatorController } from './standard_indicator.controller';
import { StandardIndicatorService } from './standard_indicator.service';
import { StandardModulesModule } from '../standard_modules/standard_module.module';
import { IndicatorModule } from '../../masters/indicators/indicator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StandardIndicator]),
    StandardModulesModule,
    IndicatorModule,
  ],
  controllers: [StandardIndicatorController],
  providers: [StandardIndicatorService],
  exports: [StandardIndicatorService],
})
export class StandardIndicatorModule {}
