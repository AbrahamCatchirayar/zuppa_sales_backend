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
import {
  CreateCategoryDto,
  CreateConfiguredProductDto,
  CreateOptionCodeDto,
} from './dto/sales.dto';
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

  // Configured Products
  @Get('configured-products')
  async getConfiguredProducts() {
    const res = await this.salesService.getConfiguredProducts();
    return {
      success: true,
      data: res.products,
      count: res.count,
    };
  }

  @Post('configured-products')
  async createConfiguredProduct(@Body() body: CreateConfiguredProductDto) {
    const product = await this.salesService.createConfiguredProduct(body);
    return {
      success: true,
      data: product,
      message: 'Product configuration published successfully',
    };
  }
}
