import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteService } from './sites.service';
import { SiteController } from './sites.controller';
import { Site } from './sites.entity';
import { AuthModule } from '../auth/auth.module';
import { DataCubeTask } from '../datacubes/task/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Site, DataCubeTask]), AuthModule],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
