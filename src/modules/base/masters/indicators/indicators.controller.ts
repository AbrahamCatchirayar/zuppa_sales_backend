/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { QUERY_PARAMS } from 'src/utils';

import {
  CreateIndicatorDto,
  IndicatorFilter,
  IndicatorUpdateDto,
} from './indicator.dto';
import { IndicatorService } from './indicator.service';

@ApiTags('Master - Indicators')
@Controller('admin')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class IndicatorsController {
  constructor(private readonly indicatorService: IndicatorService) { }

  @Get('/indicators')
  async getAllIndicator(@Query() params: IndicatorFilter) {
    const indicator = await this.indicatorService.getAllIndicator(
      QUERY_PARAMS({ ...params }),
    );
    return indicator;
  }

  @Post('/indicators')
  async createIndicator(
    @Body() body: CreateIndicatorDto,
  ) {
    const indicator = await this.indicatorService.createIndicator(body);
    return indicator;
  }

  @Get('/indicators/:id')
  async getIndicatorById(@Param('id') param: string) {
    const indicator = await this.indicatorService.getIndicatorById(param);
    return indicator;
  }

  @Put('/indicators/:id')
  async updateIndicator(
    @Param('id') param: string,
    @Body() body: IndicatorUpdateDto,
  ) {
    const indicator = await this.indicatorService.updateIndicator(param, body);
    return indicator;
  }

  @Delete('/indicators/:id')
  async deleteIndicator(@Param('id') param: string) {
    const indicator = await this.indicatorService.deleteIndicator(param);
    return indicator;
  }
} 