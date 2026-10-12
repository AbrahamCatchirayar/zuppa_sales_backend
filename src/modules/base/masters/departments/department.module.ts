import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleModule } from '../modules/module.module';
import { Department } from './department.entity';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { Question } from '../questions/question.entity';
import { Dashboard } from '../../dashboard/entities/dashboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Question, Dashboard])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
