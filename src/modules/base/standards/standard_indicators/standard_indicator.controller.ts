/* eslint-disable max-classes-per-file */

import { Body, Controller, Param, UseGuards } from '@nestjs/common';
import { Delete } from '@nestjs/common/decorators/http';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { IndicatorsRemove } from './standard_indicator.dto';
import { StandardIndicatorService } from './standard_indicator.service';

// class BodyName {
//   @ApiProperty()
//   name: string;
// }

@ApiTags('STANDARD_INDICATOR')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
@Controller('admin')
export class StandardIndicatorController {
  constructor(
    private readonly standardIndicatorService: StandardIndicatorService,
  ) {}

  // @Get('/standard_indicators')
  // async getAllStandardModules(@Query() query: StandardIndicatorFiltersDto) {
  //   const indicator =
  //     await this.standardIndicatorService.getAllStandardIndicators(
  //       QUERY_PARAMS({ ...query }),
  //     );
  //   return indicator;
  // }

  // @Post('')
  // async createIndicator(@Body() body: BodyName) {
  //   const indicator = await this.standardIndicatorService.createIndicator(body);
  //   return indicator;
  // }

  @Delete('standard/:standard_id/standard_modules/:module_id/indicators')
  async removeIndicators(
    @Param('standard_id') standard_id: string,
    @Param('module_id') module_id: string,
    @Body() body: IndicatorsRemove,
  ) {
    const indicator = await this.standardIndicatorService.removeIndicators(
      standard_id,
      module_id,
      body,
    );
    return indicator;
  }
}
