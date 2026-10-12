import {
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { CreateDepartmentDto, DepartmentFilterParams } from './department.dto';
import { DepartmentService } from './department.service';

@ApiTags('Master - Departments')
@Controller('admin')
// @ApiBearerAuth('ADMIN')
// @UseGuards(JwtAdminAuthGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('/departments')
  async getAllDepartments(@Query() params: DepartmentFilterParams) {
    const departments = await this.departmentService.getAllDepartments(params);
    return departments;
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Post('/departments')
  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  async createDepartment(@Body() body: CreateDepartmentDto) {
    const department = await this.departmentService.createDepartment(body);
    return department;
  }

  @Get('/departments/:id')
  async getDepartmentById(@Param('id') id: string) {
    const department = await this.departmentService.getDepartmentById(id);
    return department;
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Put('/departments/:id')
  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  async updateDepartment(
    @Param('id') id: string,
    @Body() body: CreateDepartmentDto,
  ) {
    const department = await this.departmentService.updateDepartment(id, body);
    return department;
  }

  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  @Delete('/departments/:id')
  @ApiBearerAuth('ADMIN')
  @UseGuards(JwtAdminAuthGuard)
  async deleteDepartment(@Param('id') id: string) {
    const department = await this.departmentService.deleteDepartment(id);
    return department;
  }
}
