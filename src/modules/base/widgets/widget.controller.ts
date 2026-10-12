import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { CustomDashboardFilterDto } from 'src/modules/tenanted/customdashboard/customdashboard.dto';
import { QUERY_PARAMS } from 'src/utils';
import { WidgetDto, WidgetFilterDto, WidgetUpdateDto } from './widget.dto';
import { WidgetService } from './widget.service';

@ApiTags('Widgets')
@Controller('admin/widgets')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get('widget_charts')
  async getChartlist(@Query() query: CustomDashboardFilterDto) {
    const param = QUERY_PARAMS({
      ...query,
    });
    return await this.widgetService.getWidgetChartList(param);
  }

  @Get()
  async getWidgets(@Query() query: WidgetFilterDto) {
    return this.widgetService.getWidgets(query);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Post('module/:module_id/indicator/:indicator_id')
  async createWidget(
    @Body() widget: WidgetDto,
    @Param('module_id') module_id: string,
    @Param('indicator_id') indicator_id: string,
  ) {
    return this.widgetService.createWidget(widget, module_id, indicator_id);
  }

  @Get(':module_id/')
  async getIndicator(
    @Param('module_id') module_id: string,
    @Query() query: WidgetFilterDto,
  ) {
    return this.widgetService.getWidgetsByModuleId(module_id, query);
  }

  @Get(':module_id/:widget_id')
  async getWidgetById(
    @Param('module_id') module_id: string,
    @Param('widget_id') widget_id: string,
  ) {
    return this.widgetService.getWidgetById(module_id, widget_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Put(':widget_id/:module_id/:indicator_id')
  @ApiOperation({
    summary: 'Update widget',
    description: 'Update an existing widget with new configuration',
  })
  @ApiParam({
    name: 'widget_id',
    description: 'Widget ID to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'module_id',
    description: 'Module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'indicator_id',
    description: 'Indicator ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: WidgetUpdateDto,
    description: 'Widget update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Widget updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Widget updated successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or widget not found',
  })
  async updateWidget(
    @Param('widget_id') widget_id: string,
    @Param('indicator_id') indicator_id: string,
    @Param('module_id') module_id: string,
    @Body() widget: WidgetUpdateDto,
  ) {
    return this.widgetService.updateWidget(
      widget_id,
      module_id,
      indicator_id,
      widget,
    );
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete(':widget_id')
  async deleteWidget(@Param('widget_id') widget_id: string) {
    return this.widgetService.deleteWidget(widget_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/widget_block/:widget_block_id')
  async deleteWidgetBlock(@Param('widget_block_id') widget_block_id: string) {
    return this.widgetService.deleteWidgetBlock(widget_block_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/widget_column/:widget_column_id')
  async deleteWidgetColumn(
    @Param('widget_column_id') widget_column_id: string,
  ) {
    return this.widgetService.deleteWidgetColumn(widget_column_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/widget_type/:widget_type_id')
  async deleteWidgetType(@Param('widget_type_id') widget_type_id: string) {
    return this.widgetService.deleteWidgetType(widget_type_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/widget_item/:widget_item_id')
  async deleteWidgetItem(@Param('widget_item_id') widget_item_id: string) {
    return this.widgetService.deleteWidgetItem(widget_item_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/widget_filter/:widget_filter_id')
  async deleteWidgetFilter(
    @Param('widget_filter_id') widget_filter_id: string,
  ) {
    return this.widgetService.deleteWidgetFilter(widget_filter_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/combined_parameter/:combined_parameter_id')
  async deleteCombinedParameter(
    @Param('combined_parameter_id') combined_parameter_id: string,
  ) {
    return this.widgetService.deleteCombinedParameter(combined_parameter_id);
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/custom_parameter/:custom_parameter_id')
  async deleteCustomParameter(
    @Param('custom_parameter_id') custom_parameter_id: string,
  ) {
    return this.widgetService.deleteCustomParameter(custom_parameter_id);
  }
}
