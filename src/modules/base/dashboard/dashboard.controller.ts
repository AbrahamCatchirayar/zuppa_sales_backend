import { Controller, Query } from '@nestjs/common';
import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';

import { CustomDashboardFilterDto } from 'src/modules/tenanted/customdashboard/customdashboard.dto';
import { QUERY_PARAMS } from 'src/utils';
import {
  DashboardDto,
  DashboardFilterDto,
  DashboardUpdateDto,
} from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboards')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard_charts')
  async getChartlist(@Query() query: CustomDashboardFilterDto) {
    const param = QUERY_PARAMS({
      ...query,
    });
    return await this.dashboardService.getChartList(param);
  }

  @Get()
  async getDashboards() {
    return this.dashboardService.getDashboards();
  }

  //   @Get('/test')
  // async getDashboardsTest() {
  //   return this.dashboardService.getDashboardsTest();
  // }

  @Post()
  async createDashboard(@Body() dashboard: DashboardDto) {
    return this.dashboardService.createDashboard(dashboard);
  }

  @Get(':department_id')
  async getDashboardByDeptId(@Param('department_id') department_id: string) {
    return this.dashboardService.getDashboardByDeptId(department_id);
  }

  @Get('standard/:standard_id')
  async getDashboardByStandardId(@Param('standard_id') standard_id: string) {
    return this.dashboardService.getDashboardByStandardId(standard_id);
  }

  @Put(':dashboard_id')
  async updateDashboard(
    @Param('dashboard_id') dashboard_id: string,
    @Body() dashboard: DashboardUpdateDto,
  ) {
    return this.dashboardService.updateDashboard(dashboard_id, dashboard);
  }

  @Delete(':dashboard_id')
  async deleteDashboard(@Param('dashboard_id') dashboard_id: string) {
    return this.dashboardService.deleteDashboard(dashboard_id);
  }

  @Delete('tab/:dashboard_tab_id')
  async deleteDashboardTab(
    @Param('dashboard_tab_id') dashboard_tab_id: string,
  ) {
    return this.dashboardService.deleteDashboardTab(dashboard_tab_id);
  }

  @Delete('block/:dashboard_block_id')
  async deleteDashboardBlock(
    @Param('dashboard_block_id') dashboard_block_id: string,
  ) {
    return this.dashboardService.deleteDashboardBlock(dashboard_block_id);
  }

  @Delete('column/:dashboard_column_id')
  async deleteDashboardColumn(
    @Param('dashboard_column_id') dashboard_column_id: string,
  ) {
    return this.dashboardService.deleteDashboardColumn(dashboard_column_id);
  }

  @Delete('type/:dashboard_type_id')
  async deleteDashboardType(
    @Param('dashboard_type_id') dashboard_type_id: string,
  ) {
    return this.dashboardService.deleteDashboardType(dashboard_type_id);
  }

  @Delete('item/:dashboard_item_id')
  async deleteDashboardItem(
    @Param('dashboard_item_id') dashboard_item_id: string,
  ) {
    return this.dashboardService.deleteDashboardItem(dashboard_item_id);
  }

  @Delete('filter/:dashboard_filter_id')
  async deleteDashboardFilter(
    @Param('dashboard_filter_id') dashboard_filter_id: string,
  ) {
    return this.dashboardService.deleteDashboardFilter(dashboard_filter_id);
  }

  @Delete('combined_parameter/:dashboard_combined_parameter_id')
  async deleteDashboardCombinedParameter(
    @Param('dashboard_combined_parameter_id')
    dashboard_combined_parameter_id: string,
  ) {
    return this.dashboardService.deleteDashboardCombinedParameter(
      dashboard_combined_parameter_id,
    );
  }

  @Delete('custom_parameter/:dashboard_custom_parameter_id')
  async deleteDashboardCustomParameter(
    @Param('dashboard_custom_parameter_id')
    dashboard_custom_parameter_id: string,
  ) {
    return this.dashboardService.deleteDashboardCustomParameter(
      dashboard_custom_parameter_id,
    );
  }
}
