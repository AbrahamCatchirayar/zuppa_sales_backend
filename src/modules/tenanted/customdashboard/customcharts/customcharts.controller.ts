import {
  Controller,
  Post,
  UseGuards,
  Body,
  Delete,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';

import { QUERY_PARAMS } from 'src/utils';
import { Query } from '@nestjs/common/decorators/http';
import { CustomChartsService } from './customcharts.service';
import {
  CustomChartFilterDto,
  CustomTypeDto,
  CustomTypeUpdateDto,
} from './customcharts.dto';

@ApiTags('CUSTOM_CHARTS')
@Controller('v1/custom-charts')
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class CustomChartsController {
  constructor(private readonly customChartsService: CustomChartsService) {}

  @Get()
  async getAllCustomCharts(@Query() query: CustomChartFilterDto) {
    const param = QUERY_PARAMS({
      ...query,
    });
    return this.customChartsService.getAllCustomCharts(param);
  }

  @Get(':id')
  async getCustomChartById(@Param('id') id: string) {
    return this.customChartsService.getCustomChartById(id);
  }

  @Post()
  async createCustomChart(@Body() params: CustomTypeDto) {
    return this.customChartsService.createCustomChart(params);
  }

  @Put(':id')
  async updateCustomChart(
    @Param('id') id: string,
    @Body() params: CustomTypeUpdateDto,
  ) {
    return this.customChartsService.updateCustomChart(id, params);
  }

  @Delete(':id')
  async deleteCustomChart(@Param('id') id: string) {
    return this.customChartsService.deleteCustomChart(id);
  }

  @Delete(':id/custom-items/:custom_item_id')
  async deleteCustomItem(
    @Param('id') id: string,
    @Param('custom_item_id') custom_item_id: string,
  ) {
    return this.customChartsService.deleteCustomChartItem(id, custom_item_id);
  }

  @Delete(':id/combined-parameters/:combined_parameter_id')
  async deleteCombinedParameter(
    @Param('id') id: string,
    @Param('combined_parameter_id') combined_parameter_id: string,
  ) {
    return this.customChartsService.deleteCustomChartCombinedParameter(
      id,
      combined_parameter_id,
    );
  }

  @Delete(':id/custom-parameters/:custom_parameter_id')
  async deleteCustomParameter(
    @Param('id') id: string,
    @Param('custom_parameter_id') custom_parameter_id: string,
  ) {
    return this.customChartsService.deleteCustomChartCustomParameter(
      id,
      custom_parameter_id,
    );
  }
}
