import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { StandardQueryDTO } from 'src/modules/tenanted/datacubes/datacube.dto';
import { QUERY_PARAMS } from 'src/utils';
import { StandardModuleService } from './standard_module.service';
import { ModulesRemove } from './standard_modules.dto';

@ApiTags('STANDARD_MODULE')
// @ApiBearerAuth('ADMIN')
// @UseGuards(JwtAdminAuthGuard)
@Controller('admin')
export class StandardModuleController {
  constructor(private readonly standardModuleService: StandardModuleService) {}

  // @Get('/standard_modules')
  // async getAllStandardModules(@Query() query: StandardModuleFiltersDto) {
  //   const standardModules =
  //     await this.standardModuleService.getAllStandardModules(
  //       QUERY_PARAMS({ ...query }),
  //     );
  //   return standardModules;
  // }

  // @Get('standard_module/:standard_module_id')
  // async getStandardModule(@Param('standard_module_id') id: string) {
  //   const standardModule =
  //     await this.standardModuleService.getStandardModule(id);
  //   return standardModule;
  // }

  // @Delete('standard_module/:standard_module_id')
  // async deleteStandardModule(@Param('standard_module_id') id: string) {
  //   const standardModule =
  //     await this.standardModuleService.deleteStandardModule(id);
  //   return standardModule;
  // }

  @Delete('/standard/:standard_id/standard_modules')
  async removeModules(
    @Param('standard_id') param: string,
    @Body() body: ModulesRemove,
  ) {
    const module = await this.standardModuleService.removeModules(param, body);
    return module;
  }

  @Get('/consolidated_standard_modules')
  @ApiQuery({ name: 'standard_ids', type: [String], isArray: true })
  async getConslidatedStandardModules(@Query() query: StandardQueryDTO) {
    const standards_ids = query.standard_ids.split(',');
    return {
      success: true,
      data: await this.standardModuleService.getConslidatedStandardModulesWithRelations(
        standards_ids,
      ),
    };
  }

  @Get('/active_standards')
  async getActiveStandards() {
    try {
      const standards =
        await this.standardModuleService.getActiveStandardsName();
      return {
        success: true,
        data: standards,
      };
    } catch (error) {
      console.error('Error fetching active standards:', error);
      throw new BadRequestException('Failed to fetch active standards');
    }
  }

  @Get('/active_standard_modules')
  async getActiveStandardModules() {
    const standard_ids: string[] =
      await this.standardModuleService.getActiveStandardIds();
    if (standard_ids.length === 0) {
      throw new BadRequestException('No active standards found');
    }
    const standard_modules =
      await this.standardModuleService.getConslidatedStandardModulesWithRelations(
        standard_ids,
      );
    return {
      success: true,
      data: standard_modules,
    };
  }

  @Get('/standard_modules/:standard_id')
  async getStandardModules(@Param('standard_id') standard_id: string) {
    const standard_modules =
      await this.standardModuleService.getStandardModules(standard_id);

    return {
      success: true,
      data: standard_modules,
    };
  }

  @Get(':department_id/standard_questions')
  async getStandardQuestions(@Param('department_id') department_id: string) {
    const standard_questions =
      await this.standardModuleService.getStandardQuestions(department_id);
    return {
      success: true,
      data: standard_questions,
    };
  }

  @Get('active_standard_questions')
  async getActiveStandardQuestions() {
    const standard_questions =
      await this.standardModuleService.getActiveStandardQuestions();
    return {
      success: true,
      data: standard_questions,
    };
  }

  @Get('active_standard_question/:uid')
  async getActiveStandardQuestion(
    @Param('uid') uid: string,
  ) {
    const standard_questions =
      await this.standardModuleService.getActiveStandardQuestion(uid);
    return {
      success: true,
      data: standard_questions,
    };
  }
}
