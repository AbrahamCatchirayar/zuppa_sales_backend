/* eslint-disable @typescript-eslint/no-explicit-any */
import { Module, forwardRef } from '@nestjs/common';
import { SectorsModule } from 'src/modules/base/sectors/sectors.module';
import { AuthModule } from '../auth/auth.module';
import { TenentSectorController } from './sector.controller';

@Module({
  imports: [forwardRef(() => AuthModule), SectorsModule],
  controllers: [TenentSectorController],
})
export class TenentSectorModule {}
