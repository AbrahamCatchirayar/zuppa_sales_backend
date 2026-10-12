import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BusinessUnit } from './businessunit.entity';
import { BusinessUnitController } from './businessunit.controller';
import { BusinessUnitService } from './businessunit.service';
import { SiteModule } from '../sites/sites.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessUnit]),
    AuthModule,
    SiteModule,
    AccountModule,
  ],
  controllers: [BusinessUnitController],
  providers: [BusinessUnitService],
  exports: [BusinessUnitService],
})
export class BusinessUnitModule {}
