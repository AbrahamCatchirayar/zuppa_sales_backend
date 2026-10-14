import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { CreateCategoryDto, CreateOptionCodeDto } from './dto/sales.dto';
import { SalesService } from './sales.service';

@Controller('v1/sales')
@ApiTags('TENENT_SALES')
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY or Slug',
})
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('categories')
  async getCategories() {
    const categories = await this.salesService.findAllCategories();
    return {
      success: true,
      data: categories,
    };
  }

  @Post('categories')
  async createCategory(@Body() body: CreateCategoryDto) {
    const category = await this.salesService.createCategory(body);
    return {
      success: true,
      data: category,
      message: 'Category created successfully',
    };
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return await this.salesService.deleteCategory(id);
  }

  @Get('categories/:categoryId/options')
  async getCategoryOptions(@Param('categoryId') categoryId: string) {
    const options = await this.salesService.getCategoryOptions(categoryId);
    return {
      success: true,
      data: options,
    };
  }

  @Post('categories/:categoryId/options')
  async createOptionCode(
    @Param('categoryId') categoryId: string,
    @Body() body: CreateOptionCodeDto,
  ) {
    const option = await this.salesService.createOptionCode(categoryId, body);
    return {
      success: true,
      data: option,
      message: 'Option code saved successfully',
    };
  }

  @Delete('options/:id')
  async deleteOptionCode(@Param('id') id: string) {
    return await this.salesService.deleteOptionCode(id);
  }
}
