import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { QUERY_PARAMS } from 'src/utils';
import {
  CreateModuleDto,
  ModuleFilterDto,
  UpdateModuleDto,
} from './module.dto';
import { ModuleService } from './module.service';

/**
 * Controller for handling module-related operations
 */
@ApiTags('Master - Modules')
@Controller('admin/modules')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class ModulesController {
  constructor(private readonly moduleService: ModuleService) {}

  /**
   * Get all modules with pagination and filtering
   */
  @Get()
  @ApiOperation({ summary: 'Get all modules' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'financial',
  })
  @ApiQuery({
    name: 'is_deleted',
    required: false,
    type: Boolean,
    example: false,
  })
  @ApiQuery({
    name: 'indicatorId',
    required: false,
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'List of modules retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Financial Management',
            description: 'Module for managing financial aspects',
            is_deleted: false,
            created_at: '2024-04-26T12:00:00.000Z',
            updated_at: '2024-04-26T12:00:00.000Z',
          },
        ],
        meta: {
          currentCount: 1,
          currentPage: 1,
          currentLimit: 10,
          totalCount: 1,
        },
      },
    },
  })
  async getAllModules(@Query() query: ModuleFilterDto) {
    const params = QUERY_PARAMS({
      page: query.page,
      limit: query.limit,
      sort: typeof query.sort === 'string' ? query.sort : 'createdAt',
      search: query.search,
      is_deleted: query.is_deleted,
      indicatorId: query.indicatorId,
    });
    return this.moduleService.getAllModules(params);
  }

  /**
   * Create a new module
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new module' })
  @ApiCreatedResponse({
    description: 'Module created successfully',
    schema: {
      example: {
        success: true,
        message: 'Module created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Financial Management',
          description: 'Module for managing financial aspects',
          is_deleted: false,
          created_at: '2024-04-26T12:00:00.000Z',
          updated_at: '2024-04-26T12:00:00.000Z',
        },
      },
    },
  })
  async createModule(@Body() body: CreateModuleDto) {
    return this.moduleService.createModule(body);
  }

  /**
   * Update an existing module
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiParam({
    name: 'id',
    description: 'Module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Module updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Module updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Financial Management',
          description: 'Updated module for managing financial aspects',
          is_deleted: false,
          created_at: '2024-04-26T12:00:00.000Z',
          updated_at: '2024-04-26T12:00:00.000Z',
        },
      },
    },
  })
  async updateModule(@Param('id') id: string, @Body() body: UpdateModuleDto) {
    return this.moduleService.updateModule(id, body);
  }

  /**
   * Get a module by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiParam({
    name: 'id',
    description: 'Module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Module retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Financial Management',
          description: 'Module for managing financial aspects',
          is_deleted: false,
          created_at: '2024-04-26T12:00:00.000Z',
          updated_at: '2024-04-26T12:00:00.000Z',
        },
      },
    },
  })
  async getModule(@Param('id') id: string) {
    const module = await this.moduleService.getModuleById(id);
    return {
      success: true,
      data: module,
    };
  }

  /**
   * Delete a module
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module' })
  @ApiParam({
    name: 'id',
    description: 'Module ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({
    description: 'Module deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Module deleted successfully',
      },
    },
  })
  async deleteModule(@Param('id') id: string) {
    return this.moduleService.deleteModule(id);
  }
}
