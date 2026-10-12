import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { StandardController } from './standard.controller';
import { Standard } from './standard.entity';
import { StandardService } from './standard.service';
import { StandardIndicator } from './standard_indicators/standard_indicator.entity';
import { Module as MasterModule } from '../masters/modules/module.entity';
import { StandardModule as StandardModuleEntity } from './standard_modules/standard_module.entity';
import { StandardRepository } from './repositories/standard.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Standard,
      StandardIndicator,
      MasterModule,
      StandardModuleEntity,
    ]),
    FileStorageModule,
  ],
  controllers: [StandardController],
  providers: [StandardService, StandardRepository],
  exports: [StandardService],
})
export class StandardModule {}
