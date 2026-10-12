import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { UserDecorator } from 'src/modules/user.decorator';
import { QUERY_PARAMS } from 'src/utils';
import {
  configDto,
  DatacubeDto,
  DatacubeFiltersDto,
  StandardQueryDTO,
} from './datacube.dto';
import { DataCubeService } from './datacube.service';
import { TenantActivityService } from '../activitylog/tenantactivity.service';

export class filterDto {
  filter_id: string;

  option_id: string;
}
@ApiTags('DATA_CUBE')
@Controller('v1/datacube')
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class DataCubeController {
  constructor(
    private readonly dataCubeService: DataCubeService,
    private readonly activityService: TenantActivityService,
  ) {}

  @Get('active_datacube_questions')
  async getAllDatacubeQuestions() {
    return await this.dataCubeService.getAllDatacubeQuestions();
  }

  @Get('standards')
  async getStandards(@Query() query: StandardQueryDTO) {
    const standards_ids = query.standard_ids.split(',');
    return {
      success: true,
      data: await this.dataCubeService.datacubeClone(standards_ids),
    };
  }

  @Get('standards/all')
  async getAllPublicStandards() {
    return {
      success: true,
      standards: await this.dataCubeService.fetchAllStandards(),
    };
  }

  @Get('')
  async getDatacubes(@Query() query: DatacubeFiltersDto) {
    const param = QUERY_PARAMS({
      page: query.page,
      limit: query.limit,
      sort: typeof query.sort === 'string' ? query.sort : 'createdAt',
      search: query.search,
    });
    return await this.dataCubeService.getDatacubes(param);
  }

  @Get(':id/questions')
  async getDataCubeQuestions(@Param('id') datacube_id: string) {
    return await this.dataCubeService.getDataCubeQuestions(datacube_id);
  }

  @Post()
  async createDataCube(@Body() body: DatacubeDto, @UserDecorator() user) {
    return await this.dataCubeService.createDataCube(body, user);
  }

  @Get(':id')
  async getDatacube(@Param('id') id: string) {
    return await this.dataCubeService.getDatacube(id);
  }

  @Post('config/datacube_frequency/:id')
  async createDatacubeFrequencyConfiguration(
    @UserDecorator() user,
    @Param('id') id: string,
    @Body() body: configDto,
  ) {
    return await this.dataCubeService.createDatacubeFrequencyConfiguration(
      id,
      body,
      user,
    );
  }

  @Delete(':id')
  async deleteDataCube(@Param('id') id: string, @UserDecorator() user) {
    return await this.dataCubeService.deleteDatacube(id, user);
  }

  @Get(':id/task')
  async getTaskByDatacubefrequency(
    @Param('id') id: string,
    @Query() query: DatacubeFiltersDto,
  ) {
    const params = QUERY_PARAMS({
      page: query.page,
      limit: query.limit,
      sort: typeof query.sort === 'string' ? query.sort : 'createdAt',
      search: query.search,
      site_name: query.site_name,
      task_status: query.task_status,
    });

    // pass page and limit into the service
    return await this.dataCubeService.getTaskByDatacubefrequency(id, params);
  }

  @Get(':id/businessunit')
  @ApiQuery({ name: 'status', required: false, type: String, description: '' })
  async getBusinessUnitsByDatacube(
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    return await this.dataCubeService.getBusinessUnitsByDatacube(id, status);
  }

  @Get(':id/sites/:site_id/tasks')
  @ApiQuery({ name: 'status', required: false, type: String, description: '' })
  async getTasksByDatacubeAndSite(
    @Param('id') datacube_id: string,
    @Param('site_id') site_id: string,
    @Query('status') status?: string,
  ) {
    return await this.dataCubeService.getTasksByDatacubeAndSite(
      datacube_id,
      site_id,
      status,
    );
  }

  @Get(':id/alltasks')
  async getTaskByDatacubefrequencyOpt(
    @Param('id') id: string,
    @Query() query: DatacubeFiltersDto,
  ) {
    return await this.dataCubeService.getTaskByDatacubefrequencyOpt(id);
  }

  @Get(':datacube_id/:widget_id/response')
  async getResponseByDatacube(
    @Param('datacube_id') datacube_id: string,
    @Param('widget_id') widget_id: string,
  ) {
    return await this.dataCubeService._getResponseByDatacube(
      datacube_id,
      widget_id,
    );
  }

  @Get(':datacube_id/:frequency_id/:site_id/:widget_id/analytics')
  async getAnalyticsResponseByWidgetOpt(
    @Param('datacube_id') datacube_id: string,
    @Param('frequency_id') frequency_id: string,
    @Param('site_id') site_id: string,
    @Param('widget_id') widget_id: string,
  ) {
    return await this.dataCubeService.getAnalyticsResponseByWidgetOpt(
      datacube_id,
      frequency_id,
      site_id,
      widget_id,
    );
  }

  @Get(':datacube_id/:frequency_id/:site_id/:dashboard_id/custom_dashboard')
  async getCustomDashboardResponseById(
    @Param('datacube_id') datacube_id: string,
    @Param('frequency_id') frequency_id: string,
    @Param('site_id') site_id: string,
    @Param('dashboard_id') dashboard_id: string,
  ) {
    return await this.dataCubeService.getCustomDashboardResponseById(
      datacube_id,
      frequency_id,
      site_id,
      dashboard_id,
    );
  }

  @Get(':datacube_id/:frequency_id/:site_id')
  async getChartFilterResponse(
    @Param('datacube_id') datacube_id: string,
    @Param('frequency_id') frequency_id: string,
    @Param('site_id') site_id: string,
    @Query('widget_item_id') widget_item_id?: string,
    @Query('filter1_id') filter1_id?: string,
    @Query('filter2_id') filter2_id?: string,
  ) {
    return this.dataCubeService.getChartFilterResponse(
      datacube_id,
      frequency_id,
      site_id,
      widget_item_id || null,
      filter1_id || null,
      filter2_id || null,
    );
  }

  @Get(
    ':datacube_id/:frequency_id/:site_id/:department_id/department-responses/:tab_id?',
  )
  async getDepartmentTaskResponses(
    @Param('datacube_id') datacube_id: string,
    @Param('frequency_id') frequency_id: string,
    @Param('site_id') site_id: string,
    @Param('department_id') department_id: string,
    @Param('tab_id') tab_id?: string, // <-- optional
  ) {
    return await this.dataCubeService.getDepartmentTaskResponses(
      datacube_id,
      frequency_id,
      site_id,
      department_id,
      tab_id,
    );
  }

  @Get(
    ':datacube_id/:frequency_id/:site_id/:standard_id/standard-responses/:tab_id?',
  )
  async getStandardTaskResponses(
    @Param('datacube_id') datacube_id: string,
    @Param('frequency_id') frequency_id: string,
    @Param('site_id') site_id: string,
    @Param('standard_id') standard_id: string,
    @Param('tab_id') tab_id?: string, // <-- optional
  ) {
    return await this.dataCubeService.getStandardTaskResponses(
      datacube_id,
      frequency_id,
      site_id,
      standard_id,
      tab_id,
    );
  }

  @Get(':datacube_id/:site_id/:widget_id/analytics/timeseries')
  async getAnalyticsTimeSeriesResponse(
    @Param('datacube_id') datacube_id: string,
    @Param('site_id') site_id: string,
    @Param('widget_id') widget_id: string,
  ) {
    return await this.dataCubeService.getAnalyticsTimeSeriesResponse(
      datacube_id,
      site_id,
      widget_id,
    );
  }

  @Get(':datacube_id/:frequency_id/:site_id/filter')
  @ApiQuery({
    name: 'filters',
    required: false,
    type: String,
    description:
      'JSON array of filter objects as a string. Example: [{"filter_id":"f1","option_id":"o1"},{"filter_id":"f2","option_id":"o2"}]',
  })
  async getFilterTimeSeriesResponse(
    @Param('datacube_id') datacube_id: string,
    @Param('frequency_id') frequency_id: string,
    @Param('site_id') site_id: string,
    @Query('filters') filters: string,
  ) {
    // Service has robust parsing for JSON string, single id string or already-parsed objects
    return await this.dataCubeService.getChartFilterResponse1(
      datacube_id,
      frequency_id,
      site_id,
      filters,
    );
  }

  @Get(':datacube_id/:site_id/:dashboard_id/dashboard/timeseries')
  async getDashboardTimeSeriesResponse(
    @Param('datacube_id') datacube_id: string,
    @Param('site_id') site_id: string,
    @Param('dashboard_id') dashboard_id: string,
  ) {
    return await this.dataCubeService.getDashboardTimeSeriesResponse(
      datacube_id,
      site_id,
      dashboard_id,
    );
  }

  @Get('/dashboard/:dataCube_id/:frequency_id/:site_id')
  async getDashboardResponses(
    // @Param('department_id') department_id: string,
    @Param('dataCube_id') dataCube_id: string,
    @Param('frequency_id') frequency_id: string,
    @Param('site_id') site_id: string,
  ) {
    return await this.dataCubeService.getDashboardResponsesV2(
      dataCube_id,
      frequency_id,
      site_id,
    );
  }

  @Get('standard/:standard_id/datacube/:datacube_id/consolidated_report')
  async getConsolidatedReport(
    @Param('standard_id') standard_id: string,
    @Param('datacube_id') datacube_id: string,
  ) {
    return await this.dataCubeService.consolidatedReport(
      standard_id,
      datacube_id,
    );
  }

  @Get('standard/:standard_id/datacube/:datacube_id/report_progress')
  async getReportProgress(
    @Param('standard_id') standard_id: string,
    @Param('datacube_id') datacube_id: string,
  ) {
    return await this.dataCubeService.getReportProgress(
      standard_id,
      datacube_id,
    );
  }

  @Get(':datacube_id/task_progress')
  async getTaskProgress(@Param('datacube_id') datacube_id: string) {
    return await this.dataCubeService.getTaskProgress(datacube_id);
  }

  @Get('homepage/:datacube_id')
  async getHomePageResponse(@Param('datacube_id') datacube_id: string) {
    return await this.dataCubeService.getHomepageWidgetResponse(datacube_id);
  }
}
