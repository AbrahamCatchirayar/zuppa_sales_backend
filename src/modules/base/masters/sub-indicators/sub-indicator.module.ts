import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleModule } from '../modules/module.module';
import { SubIndicator } from './sub-indicator.entity';
import { SubIndicatorService } from './sub-indicator.service';
import { SubIndicatorsController } from './sub-indicator.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubIndicator]), ModuleModule],
  controllers: [SubIndicatorsController],
  providers: [SubIndicatorService],
  exports: [SubIndicatorService],
})
export class SubIndicatorModule {}
