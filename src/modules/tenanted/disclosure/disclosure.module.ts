import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Disclosure } from './disclosure.entity';
import { DisclosureService } from './disclosure.service';
import { DisclosureController } from './disclosure.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disclosure]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [DisclosureController],
  providers: [DisclosureService],
  exports: [DisclosureService],
})
export class DisclosureModule {}
