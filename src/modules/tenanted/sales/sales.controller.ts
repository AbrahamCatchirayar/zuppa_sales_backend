import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import {
  CreateCategoryDto,
  CreateConfiguredProductDto,
  CreateJobOrderDto,
  CreateOptionCodeDto,
  UpdateConfiguredProductDto,
  UpdateJobOrderDto,
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
    return this.salesService.deleteCategory(id);
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
    return this.salesService.deleteOptionCode(id);
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

  @Put('configured-products/:id')
  async updateConfiguredProduct(
    @Param('id') id: string,
    @Body() body: UpdateConfiguredProductDto,
  ) {
    const product = await this.salesService.updateConfiguredProduct(id, body);
    return {
      success: true,
      data: product,
      message: 'Configured product updated successfully',
    };
  }

  @Delete('configured-products/:id')
  async deleteConfiguredProduct(@Param('id') id: string) {
    return this.salesService.deleteConfiguredProduct(id);
  }

  // Job Orders
  @Get('job-orders')
  async getJobOrders() {
    const res = await this.salesService.getJobOrders();
    return {
      success: true,
      data: res.orders,
      count: res.count,
    };
  }

  @Get('job-orders/:id')
  async getJobOrderById(@Param('id') id: string) {
    const order = await this.salesService.getJobOrderById(id);
    return {
      success: true,
      data: order,
    };
  }

  @Post('job-orders')
  async createJobOrder(@Body() body: CreateJobOrderDto) {
    const order = await this.salesService.createJobOrder(body);
    return {
      success: true,
      data: order,
      message: 'Job order created successfully',
    };
  }

  @Put('job-orders/:id')
  async updateJobOrder(
    @Param('id') id: string,
    @Body() body: UpdateJobOrderDto,
  ) {
    const order = await this.salesService.updateJobOrder(id, body);
    return {
      success: true,
      data: order,
      message: 'Job order updated successfully',
    };
  }

  @Delete('job-orders/:id')
  async deleteJobOrder(@Param('id') id: string) {
    return this.salesService.deleteJobOrder(id);
  }
}

