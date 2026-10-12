import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { SectorFilter } from 'src/modules/base/sectors/sectors.dto';
import { SectorService } from 'src/modules/base/sectors/sectors.service';
import { QUERY_PARAMS } from 'src/utils';

@Controller('v1')
@ApiTags('TENENT_SECTOR')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('USER')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class TenentSectorController {
  constructor(
    private sectorservice: SectorService,
    // private readonly standardservice: StandardsService,
  ) {}

  @Get('sector')
  async getAllSectors(@Query() params: SectorFilter) {
    try {
      const { page, limit, sort } = params;
      return await this.sectorservice.getAllSectors(
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

  @Get('/allsectors')
  async getSectors() {
    return this.sectorservice.getSectors();
  }

  // @Get('standards')
  // async getAllStandards(@Query() params: FilterStandardQuery) {
  //   try {
  //     const { page, limit, sort } = params;
  //     return await this.standardservice.getAllStandards(
  //       QUERY_PARAMS({
  //         page,
  //         limit,
  //         sort,
  //         ...params,
  //       }),
  //     );
  //   } catch (err) {
  //     throw new BadRequestException(err);
  //   }
  // }

  // @Get(':id/standard')
  // async getStandard(@Param('id') id: string) {
  //   try {
  //     return await this.standardservice.standardGetById(id);
  //   } catch (err) {
  //     throw new BadRequestException(err);
  //   }
  // }

  @Get(':id/sector')
  async getSector(@Param('id') id: string) {
    const sector = await this.sectorservice.getSector(id);
    if (!sector) {
      throw new BadRequestException('Invalid sector');
    }
    return sector;
  }
}
