import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandardTemplateController } from './standard_template.controller';
import { StandardTemplate } from './standard_template.entity';
import { StandardTemplateService } from './standard_template.service';
import { StandardTemplateQuestion } from './standard_template_questions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StandardTemplate, StandardTemplateQuestion]),
  ],
  controllers: [StandardTemplateController],
  providers: [StandardTemplateService],
  exports: [StandardTemplateService],
})
export class StandardTemplateModule {}
