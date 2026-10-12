/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-await */
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import * as fs from 'fs';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { multerOptionsFile, QUERY_PARAMS } from 'src/utils';
import { IndustryDto, IndustryFilter } from './industries.dto';
import { IndustryService } from './industries.service';

@ApiTags('ADMIN_INDUSTRY')
@Controller('admin/industry')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Post('create')
  @ApiBearerAuth('ADMIN')
  @ApiOperation({
    summary: 'Enter sector as string',
    description: 'sector should be string',
  })
  async createIndustry(@Body() params: IndustryDto) {
    return this.industryService.createIndustry(params);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @UseGuards(JwtAdminAuthGuard)
  @ApiBearerAuth('ADMIN')
  @UseInterceptors(FileInterceptor('file', multerOptionsFile))
  async uploadIndustries(@UploadedFile() file) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      if (!fileBuffer) {
        throw new BadRequestException('INVALID EXCEL FORMAT');
      }
      return await this.industryService.uploadIndustry(fileBuffer);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get('')
  async getIndustries(@Query() params: IndustryFilter) {
    try {
      const { page, limit, sort } = params;
      return await this.industryService.getAllIndustries(
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

  @Put(':id')
  async updateIndustry(@Param('id') id: string, @Body() params: IndustryDto) {
    return await this.industryService.updateIndustry(id, params);
  }

  @Delete(':id')
  async deleteIndustry(@Param('id') id: string) {
    return await this.industryService.deleteIndustry(id);
  }

  @Put(':id/activate')
  async reActivateDeleteSector(@Param('id') id: string) {
    return await this.industryService.reActivateDelete(id);
  }
}
