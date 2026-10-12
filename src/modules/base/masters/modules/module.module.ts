import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Indicator } from '../indicators/indicator.entity';
import { Module as MasterModule } from './module.entity';
import { ModuleService } from './module.service';
import { ModulesController } from './modules.controller';

/**
 * Module for handling module-related operations
 */
@Module({
  imports: [TypeOrmModule.forFeature([MasterModule, Indicator])],
  controllers: [ModulesController],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class ModuleModule {}
