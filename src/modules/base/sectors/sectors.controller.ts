/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { multerOptionsFile, QUERY_PARAMS } from 'src/utils';
import { SectorDto, SectorFilter } from './sectors.dto';
import { SectorService } from './sectors.service';

@ApiTags('ADMIN_SECTORS')
@Controller('admin/sector')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Post('create')
  async createSector(@Body() params: SectorDto) {
    return await this.sectorService.createSector(params);
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
  async uploadSectors(@UploadedFile() file) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      if (!fileBuffer) {
        throw new BadRequestException('INVALID EXCEL FORMAT');
      }
      const result = await this.sectorService.uploadSector(fileBuffer);
      return result;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Get('')
  async getSectors(@Query() params: SectorFilter) {
    const { page, limit, sort } = params;
    return await this.sectorService.getAllSectors(
      QUERY_PARAMS({
        page,
        limit,
        sort,
        ...params,
      }),
    );
  }

  @Get(':id')
  async getSector(@Param('id') id: string) {
    return await this.sectorService.getSector(id);
  }

  @Put(':id')
  async updateSector(@Param('id') id: string, @Body() params: SectorDto) {
    return await this.sectorService.updateSector(id, params);
  }

  @Delete(':id')
  async deleteSector(@Param('id') id: string) {
    return await this.sectorService.deleteSector(id);
  }

  @Put(':id/activate')
  async reActivateDeleteSector(@Param('id') id: string) {
    return await this.sectorService.reActivateDelete(id);
  }
}
