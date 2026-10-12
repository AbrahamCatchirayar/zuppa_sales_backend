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
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';

import { QUERY_PARAMS } from 'src/utils';
import {
  CustomDashboardDto,
  CustomDashboardFilterDto,
  CustomDashboardUpdateDto,
} from './customdashboard.dto';
import { CustomDashboardService } from './customdashboard.service';

@ApiTags('CUSTOM_DASHBOARD')
@Controller('v1/custom-dashboard')
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class CustomDashboardController {
  constructor(
    private readonly customDashboardService: CustomDashboardService,
  ) {}

  @Post()
  async createCustomDashboard(@Body() params: CustomDashboardDto) {
    return this.customDashboardService.createCustomDashboard(params);
  }

  @Get()
  async getAllCustomDashboards(@Query() query: CustomDashboardFilterDto) {
    const param = QUERY_PARAMS({
      ...query,
    });
    return this.customDashboardService.getAllCustomDashboards(param);
  }

  @Get(':id')
  async getCustomDashboardById(@Param('id') id: string) {
    return this.customDashboardService.getCustomDashboardById(id);
  }

  @Put(':id')
  async updateCustomDashboard(
    @Param('id') id: string,
    @Body() params: CustomDashboardUpdateDto,
  ) {
    return this.customDashboardService.updateCustomDashboard(id, params);
  }

  @Delete(':id')
  async deleteCustomDashboard(@Param('id') id: string) {
    return this.customDashboardService.deleteCustomDashboard(id);
  }

  @Delete('block/:id')
  async deleteCustomDashboardBlock(@Param('id') id: string) {
    return this.customDashboardService.deleteCustomDashboardBlock(id);
  }

  @Delete('column/:id')
  async deleteCustomDashboardColumn(@Param('id') id: string) {
    return this.customDashboardService.deleteCustomDashboardColumn(id);
  }

  @Delete('type/:id')
  async deleteCustomDashboardType(@Param('id') id: string) {
    return this.customDashboardService.deleteCustomDashboardType(id);
  }
}
