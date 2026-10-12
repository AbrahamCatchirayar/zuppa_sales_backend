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
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { IUser, UserDecorator } from 'src/modules/user.decorator';
import { QUERY_PARAMS } from 'src/utils';
import { DisclosureService } from './disclosure.service';
import {
  DisclosureDto,
  FilterDisclosureDto,
  UpdateDisclosureDto,
} from './disclosure.dto';

@ApiTags('DISCLOSURE')
@Controller('v1/disclosure')
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class DisclosureController {
  constructor(private readonly disclosureService: DisclosureService) {}

  @Get('')
  async getAllDisclosures(@Query() params: FilterDisclosureDto) {
    try {
      return await this.disclosureService.getAllDisclosures(
        QUERY_PARAMS({
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          ...params,
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/:id')
  async getDisclosureById(@Param('id') id: string) {
    try {
      return await this.disclosureService.getDisclosure(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/:name/name')
  async getDisclosureByName(
    @Param('name') name: string,
    @Query() params: FilterDisclosureDto,
  ) {
    try {
      return await this.disclosureService.getDisclosureByName(
        name,
        QUERY_PARAMS({
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          ...params,
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/:datacube_id/datacube')
  async getDisclosureByDatacube(
    @Param('datacube_id') datacube_id: string,
    @Query() params: FilterDisclosureDto,
  ) {
    try {
      return await this.disclosureService.getDisclosureByDatacube(
        datacube_id,
        QUERY_PARAMS({
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          ...params,
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  //   @ApiBody({ type: [DisclosureDto] })
  @ApiOperation({ summary: 'Create a new disclosure' })
  @Post('create')
  async createDisclosure(
    @Body() disclosureDto: DisclosureDto,
    @UserDecorator() user: IUser,
  ) {
    return this.disclosureService.createDisclosure(disclosureDto, user);
  }

  @Get('/:name/:datacube_id/datacube')
  async getDisclosureByNameAndDatacube(
    @Param('name') name: string,
    @Param('datacube_id') datacube_id: string,
    @Query() params: FilterDisclosureDto,
  ) {
    try {
      return await this.disclosureService.getDisclosureByNameAndDatacube(
        name,
        datacube_id,
        QUERY_PARAMS({
          page: params.page,
          limit: params.limit,
          sort: params.sort,
          ...params,
        }),
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Put(':id')
  async updateDisclosure(
    @Param('id') id: string,
    @Body() params: UpdateDisclosureDto,
  ) {
    try {
      return await this.disclosureService.updateDisclosure(id, params);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('/:datacube_id/datacube/report')
  async getDisclosureReport(@Param('datacube_id') datacube_id: string) {
    try {
      return await this.disclosureService.getDisclosureReport(datacube_id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete(':id')
  async deleteDisclosure(@Param('id') id: string) {
    try {
      return await this.disclosureService.deleteDisclosure(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
