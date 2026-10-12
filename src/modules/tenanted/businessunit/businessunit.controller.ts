/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
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
import { ApiBearerAuth, ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { QUERY_PARAMS } from 'src/utils';
import { IUser, UserDecorator } from 'src/modules/user.decorator';
import { BusinessUnitService } from './businessunit.service';
import {
  FilterBusinessUnitDto,
  BasicBusinessUnitDto,
  UpdateBusinessUnitDto,
} from './businessunit.dto';

@Controller('/v1/businessunit')
@ApiTags('TENENT_AUTH BUSINESS_UNIT')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('USER')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class BusinessUnitController {
  constructor(private readonly busUnitService: BusinessUnitService) {}

  @ApiBody({ type: [BasicBusinessUnitDto] })
  @Post('create')
  async createBusinessUnit(
    @Body() params: BasicBusinessUnitDto[],
    @UserDecorator() user: IUser,
    @Query()
    queryParams: {
      onboarding: string;
    },
  ) {
    return this.busUnitService.createBusinessUnit(params, user, queryParams);
  }

  @Get('')
  async getAllBusinessUnits(@Query() params: FilterBusinessUnitDto) {
    try {
      const { page, limit, sort } = params;
      return await this.busUnitService.getAllBusinessUnits(
        QUERY_PARAMS({
          page,
          limit,
          sort,
          ...params,
        }),
      );
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get(':id/')
  async getBusinessUnit(@Param('id') id: string) {
    const businessUnit = await this.busUnitService.getBusinessUnitById(id);
    return businessUnit;
  }

  @Put(':id')
  async updateBusinessUnit(
    @Param('id') id: string,
    @Body() params: UpdateBusinessUnitDto,
  ) {
    const updatedBusinessUnit = await this.busUnitService.updateBusinessUnit(
      id,
      params,
    );
    return updatedBusinessUnit;
  }

  @Delete(':id')
  async deleteBusinessUnit(@Param('id') id: string) {
    const deleteBusinessUnit = await this.busUnitService.deleteBusinessUnit(id);
    return deleteBusinessUnit;
  }
}
