/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  CreateSubIndicatorDto,
  SubIndicatorFilter,
  UpdateSubIndicatorDto,
} from './sub-indicator.dto';
import { SubIndicatorService } from './sub-indicator.service';

@ApiTags('Master - Sub Indicators')
@Controller('admin')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class SubIndicatorsController {
  constructor(private readonly subindicatorService: SubIndicatorService) {}

  @Get('/sub-indicators')
  async listAllSubIndicators(@Query() params: SubIndicatorFilter) {
    return await this.subindicatorService.findAllSubIndicators(
      QUERY_PARAMS({ ...params }),
    );
  }

  @Post('/sub-indicators')
  async createIndicator(@Body() param: CreateSubIndicatorDto) {
    return await this.subindicatorService.createSubIndicator(param);
  }

  @Get('/sub-indicators/:id')
  async getSubIndicatorById(@Param('id') id: string) {
    return await this.subindicatorService.getSubIndicatorById(id);
  }

  @Put('/sub-indicators/:id')
  async updateIndicator(
    @Param('id') id: string,
    @Body() update: UpdateSubIndicatorDto,
  ) {
    return await this.subindicatorService.updateSubIndicator(id, update);
  }

  @Delete('/sub-indicators/:id')
  async deleteIndicator(@Param('id') id: string) {
    return await this.subindicatorService.deleteSubIndicator(id);
  }

  @Put('/sub-indicators/:id/activate')
  async reActivateDeleteSector(@Param('id') id: string) {
    return await this.subindicatorService.reActivateDelete(id);
  }
}
