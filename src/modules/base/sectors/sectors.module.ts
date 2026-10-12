import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectorController } from './sectors.controller';
import { Sectors } from './sectors.entity';
import { SectorService } from './sectors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sectors])],
  controllers: [SectorController],
  providers: [SectorService],
  exports: [SectorService],
})
export class SectorsModule {}
