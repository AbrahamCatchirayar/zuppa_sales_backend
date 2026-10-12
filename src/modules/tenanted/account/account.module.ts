import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterAccount } from 'src/modules/base/accounts/account.entity';
import { Account } from './account.entity';
import { AccountService } from './account.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    TypeOrmModule.forFeature([MasterAccount]),
  ],
  controllers: [],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
