import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QUERY_PARAMS } from 'src/utils';
import { StandardTemplateService } from './standard_template.service';
import {
  StandardTemplateDto,
  StandardTemplateFilterDto,
} from './standard_template.dto';

@ApiTags('STANDARD_TEMPLATE')
@Controller('admin/standardtemplates')
export class StandardTemplateController {
  constructor(private readonly templateService: StandardTemplateService) {}

  @Get('/standardtemplates')
  async getStandardTemplates(@Query() query: StandardTemplateFilterDto) {
    return await this.templateService.getStandardTemplates(query);
  }

  @Post('/standardtemplate/addquestions')
  async addTemplateQuestion(@Body() params: StandardTemplateDto) {
    return await this.templateService.addQuestions(params);
  }
}
