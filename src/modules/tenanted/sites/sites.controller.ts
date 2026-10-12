/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { QUERY_PARAMS } from 'src/utils';
import { SiteService } from './sites.service';
import { FilterSiteDto } from './sites.dto';

@Controller('/v1/sites')
@ApiTags('TENENT_AUTH SITES')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('USER')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  //   @Post()
  //   createSite(@Body() params: SiteDto) {
  //     return this.siteService.createSite(params);
  //   }

  @Get('')
  getAllSites(@Query() params: FilterSiteDto) {
    try {
      const { page, limit, sort } = params;
      return this.siteService.getAllSites(
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

  @Get('/allModules')
  async getSites() {
    return this.siteService.getSites();
  }

  //   @Get(':id/')
  //   async getSite(@Param('id') id: string) {
  //     const site = await this.siteService.getSiteById(id);
  //     return {
  //       success: true,
  //       site,
  //     };
  //   }

  //   @Put(':id')
  //   async update(@Param('id') id: string, @Body() params: UpdateSiteDto) {
  //     return this.siteService.updateSite(id, params);
  //   }

  //   @Delete(':id')
  //   async deleteSite(@Param('id') id: string) {
  //     const deletedSite = await this.siteService.deleteSite(id);
  //     return deletedSite;
  //   }
}
