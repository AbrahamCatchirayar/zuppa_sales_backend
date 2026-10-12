import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantActivity } from './tenantactivity.entity';
import { Module } from '@nestjs/common';
import { TenantActivityService } from './tenantactivity.service';
import { TenantActivityController } from './tenantactivity.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TenantActivity]), AuthModule],
  controllers: [TenantActivityController],
  providers: [TenantActivityService],
  exports: [TenantActivityService],
})
export class TenantActivityModule {}
