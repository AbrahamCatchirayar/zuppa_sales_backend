import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandardModule as Standard } from './standard_module.entity';
import { StandardModuleController } from './standard_module.controller';
import { StandardModuleService } from './standard_module.service';
import { StandardModule } from '../standard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Standard]), StandardModule],
  controllers: [StandardModuleController],
  providers: [StandardModuleService],
  exports: [StandardModuleService],
})
export class StandardModulesModule {}
