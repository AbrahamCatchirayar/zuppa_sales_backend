import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { UseGuards } from '@nestjs/common';
import { TenantActivityService } from './tenantactivity.service';
import { QUERY_PARAMS } from 'src/utils';
import { ActivityFiltersDto } from './tenantactivity.dto';

@Controller('v1/tenantactivity')
@ApiTags('TENANT_ACTIVITY')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('USER')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class TenantActivityController {
  constructor(private readonly tenantActivityService: TenantActivityService) {}

  @Get()
  async getAll(@Query() query: ActivityFiltersDto) {
    const param = QUERY_PARAMS({
      page: query.page,
      limit: query.limit,
      sort: typeof query.sort === 'string' ? query.sort : 'createdAt',
      search: query.search,
      created_date: query.created_date,
    });
    return await this.tenantActivityService.getAll(param);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tenantActivityService.findOne(id);
  }
}
