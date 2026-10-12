import {
  applyDecorators,
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Delete } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { multerOptionsImage, QUERY_PARAMS } from 'src/utils';
import { STANDARD_ROUTES } from './constants/standard.constants';
import {
  ErrorResponseDto,
  FlagDto,
  StandardResponseDto,
} from './dto/standard.response.dto';
import {
  StandardErrorCode,
  StandardException,
} from './exceptions/standard.exception';
import {
  AddModulesIndicatorsQuestionsToStandardDto,
  AddModulesIndicatorsQuestionsToStandardDto_opt,
  CreateIndicatorForStandardDto,
  CreateModuleForStandardDto,
  CreateStandardQuestionsDto,
  StandardDto,
  StandardFilter,
  StandardSequenceType,
  UpdateAddRemoveQuestionSequenceDto,
  UpdateSequenceDto,
  UpdateStandardDto,
} from './standard.dto';
import { Standard } from './standard.entity';
import { StandardService } from './standard.service';

// Response type interfaces
interface PaginationMeta {
  currentCount: number;
  currentPage: number;
  currentLimit: number;
  totalCount: number;
}

interface StandardResponse {
  success: boolean;
  standards?: Standard[];
  standard?: Standard;
  message?: string;
  data?: any;
  meta?: PaginationMeta;
}

// API Documentation decorators
function CreateStandardApiDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload a logo for the standard' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
          name: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name'],
      },
    }),
  );
}

// Error handling utility
class StandardError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
  ) {
    super(message);
    this.name = 'StandardError';
  }
}

interface StandardQueryParams {
  limit: number;
  skip: number;
  sort: any;
  filter: {
    search?: string;
    is_deleted?: boolean;
    [key: string]: any;
  };
  page: number;
}

@ApiTags('MASTER_STANDARDS')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
@Controller(STANDARD_ROUTES.BASE)
export class StandardController {
  constructor(private readonly standardService: StandardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all standards',
    description:
      'Retrieves a paginated list of standards with optional filtering and sorting',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: null,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: null,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description:
      'Sort field and direction (e.g., "name:asc" or "createdAt:desc")',
    example: null,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter standards by name or description',
    example: null,
  })
  @ApiQuery({
    name: 'is_deleted',
    required: false,
    type: Boolean,
    description: 'Filter standards by deletion status',
    example: null,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of standards with pagination metadata',
    type: StandardResponseDto,
    examples: {
      'Success Response': {
        summary: 'Successful response with standards list',
        value: {
          success: true,
          standards: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'ISO 9001:2015',
              description: 'Quality Management System Standard',
              logo_url: 'https://example.com/iso9001.png',
              createdAt: '2024-03-20T10:00:00Z',
              updated_at: '2024-03-20T10:00:00Z',
              is_deleted: false,
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
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input parameters',
    type: ErrorResponseDto,
    examples: {
      'Invalid Input': {
        summary: 'Error response for invalid input',
        value: {
          message: 'Invalid input parameters',
          errorCode: 'INVALID_INPUT',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
    type: ErrorResponseDto,
    examples: {
      Unauthorized: {
        summary: 'Error response for unauthorized access',
        value: {
          message: 'Unauthorized access',
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
        },
      },
    },
  })
  async listAllStandards(@Query() query: StandardFilter) {
    try {
      const param = QUERY_PARAMS({
        page: query.page,
        limit: query.limit,
        search: query?.search,
        is_deleted: query?.is_deleted,
        sort: typeof query.sort === 'string' ? query.sort : 'createdAt',
      });
      return await this.standardService.getAllStandards(param);
    } catch (error) {
      if (error instanceof StandardException) {
        throw error;
      }
      throw new StandardException(
        error.message,
        StandardErrorCode.INVALID_INPUT,
      );
    }
  }

  // New API's Created

  // New API's Created

  @Post()
  @ApiOperation({
    summary: 'Create a new standard',
    description: 'Creates a new standard with optional logo upload',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Standard logo image file',
        },
        name: {
          type: 'string',
          description: 'Name of the standard',
          example: 'ISO 9001:2015',
        },
        description: {
          type: 'string',
          description: 'Description of the standard',
          example: 'Quality Management System Standard',
        },
      },
      required: ['name'],
      example: {
        name: 'ISO 9001:2015',
        description: 'Quality Management System Standard',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Standard created successfully',
    type: StandardResponseDto,
    examples: {
      'Success Response': {
        summary: 'Successful response for standard creation',
        value: {
          success: true,
          message: 'Standard created successfully',
          standard: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'ISO 9001:2015',
            description: 'Quality Management System Standard',
            logo_url: 'https://example.com/iso9001.png',
            createdAt: '2024-03-20T10:00:00Z',
            updated_at: '2024-03-20T10:00:00Z',
            is_deleted: false,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or duplicate standard name',
    type: ErrorResponseDto,
    examples: {
      'Duplicate Standard': {
        summary: 'Error response for duplicate standard',
        value: {
          message: 'Standard with name ISO 9001:2015 already exists',
          errorCode: 'DUPLICATE_ENTRY',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
    type: ErrorResponseDto,
    examples: {
      Unauthorized: {
        summary: 'Error response for unauthorized access',
        value: {
          message: 'Unauthorized access',
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptionsImage))
  async createStandard(
    @UploadedFile() file: any,
    @Body() body: StandardDto,
  ): Promise<StandardResponseDto> {
    try {
      return await this.standardService.createStandard(body, file);
    } catch (error) {
      if (error instanceof StandardException) {
        throw error;
      }
      throw new StandardException(
        error.message,
        StandardErrorCode.INVALID_INPUT,
      );
    }
  }

  @Post(STANDARD_ROUTES.MODULES)
  @ApiOperation({
    summary:
      'Create / Remove a new module for a standard (along with indicators, standard questions)',
    description:
      'for create give master_module id / Remove give standard_module id  ',
  })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns the standard details',
  //   type: StandardResponseDto,
  // })
  async createModuleForStandard(
    @Param('standard_id') standardId: string,
    @Body() body: CreateModuleForStandardDto,
  ) {
    try {
      return await this.standardService.createModuleForStandard(
        standardId,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(STANDARD_ROUTES.INDICATORS)
  @ApiOperation({
    summary: 'Create / Remove a new indicator for a standard',
    description:
      'for create give master_indicator id / Remove give standard_indicator id  ',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the standard details',
    type: StandardResponseDto,
  })
  async createIndicatorForStandard(
    @Param('standard_id') standardId: string,
    @Param('standard_module_id') moduleId: string,
    @Body() body: CreateIndicatorForStandardDto,
  ) {
    try {
      return await this.standardService.createIndicatorForStandard(
        standardId,
        moduleId,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(STANDARD_ROUTES.STANDARD_ID)
  @ApiOperation({
    summary: 'Get standard by ID with paginated modules',
    description:
      'Retrieves a standard by its unique identifier with paginated modules and indicators',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the standard details with paginated modules',
    type: StandardResponseDto,
    examples: {
      'Success Response': {
        summary: 'Successful response for standard retrieval with pagination',
        value: {
          success: true,
          standard: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'ISO 9001:2015',
            description: 'Quality Management System Standard',
            logo_url: 'https://example.com/iso9001.png',
            createdAt: '2024-03-20T10:00:00Z',
            updated_at: '2024-03-20T10:00:00Z',
            is_deleted: false,
            standard_modules: [
              {
                id: 'module-1',
                name: 'Module 1',
                sequence: 1,
              },
            ],
          },
          meta: {
            currentPage: 1,
            currentLimit: 10,
            currentCount: 10,
            totalCount: 25,
            totalPages: 3,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Standard not found',
    type: ErrorResponseDto,
    examples: {
      'Not Found': {
        summary: 'Error response for standard not found',
        value: {
          message: 'Standard not found',
          errorCode: 'STANDARD_NOT_FOUND',
          statusCode: 404,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
    type: ErrorResponseDto,
    examples: {
      Unauthorized: {
        summary: 'Error response for unauthorized access',
        value: {
          message: 'Unauthorized access',
          errorCode: 'UNAUTHORIZED',
          statusCode: 401,
        },
      },
    },
  })
  async getStandardById(
    @Param('standard_id') standardId: string,
    @Query() flag: FlagDto,
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10, // Default to 10 records per page
  ): Promise<StandardResponseDto> {
    try {
      this.validateId(standardId, 'Standard ID');
      const response = await this.standardService.getStandardById(
        standardId,
        flag.flag,
        page,
        limit,
      );
      this.validateStandardExists(response.standard, standardId);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put(STANDARD_ROUTES.STANDARD_ID)
  @ApiOperation({ summary: 'Update standard details' })
  @ApiResponse({
    status: 200,
    description: 'Standard updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        standard: { $ref: '#/components/schemas/Standard' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateStandardById(
    @Param('standard_id') standardId: string,
    @Body() body: UpdateStandardDto,
  ): Promise<StandardResponse> {
    try {
      this.validateId(standardId, 'Standard ID');
      return await this.standardService.updateStandardById(standardId, body);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(STANDARD_ROUTES.STANDARD_ID)
  @ApiOperation({ summary: 'Delete a standard' })
  @ApiResponse({
    status: 200,
    description: 'Standard deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteStandardById(
    @Param('standard_id') standardId: string,
  ): Promise<StandardResponse> {
    try {
      this.validateId(standardId, 'Standard ID');
      return await this.standardService.deleteStandardById(standardId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(STANDARD_ROUTES.ADD_BYMODULE)
  @ApiOperation({
    summary: 'Add modules , indicators and questions to a standard One',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addModulesIndicatorsQuestionsOne(
    @Param('standard_id') standardId: string,
    @Query('sequence') sequence: number,
    @Body() body: AddModulesIndicatorsQuestionsToStandardDto_opt,
  ): Promise<StandardResponse> {
    try {
      this.validateId(standardId, 'Standard ID');
      return await this.standardService.addModulesIndicatorsQuestionsToStandardOne(
        standardId,
        sequence,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(STANDARD_ROUTES.ADD_QUESTION)
  @ApiOperation({
    summary: 'Add modules , indicators and questions to a standard',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addModulesIndicatorsQuestions(
    @Param('standard_id') standardId: string,
    @Body() body: AddModulesIndicatorsQuestionsToStandardDto,
  ): Promise<StandardResponse> {
    try {
      this.validateId(standardId, 'Standard ID');
      return await this.standardService.addModulesIndicatorsQuestionsToStandard(
        standardId,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(STANDARD_ROUTES.ADD_REMOVE_QUESTION_SEQUENCE)
  @ApiOperation({
    summary: 'Question Sequence Add / Remove ',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAddRemoveQuestionSequence(
    @Param('standard_id') standardId: string,
    @Body() body: UpdateAddRemoveQuestionSequenceDto,
  ): Promise<StandardResponse> {
    try {
      this.validateId(standardId, 'Standard ID');
      return await this.standardService.updateAddRemoveQuestionSequence(
        standardId,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(STANDARD_ROUTES.ADD_STANDARD_QUESTIONS)
  @ApiOperation({ summary: 'Add question on standardquestion' })
  async addStandardQuestions(
    @Param('standard_id') standardId: string,
    @Param('module_id') moduleId: string,
    @Param('indicator_id') indicatorId: string,
    @Body() body: CreateStandardQuestionsDto,
  ) {
    return await this.standardService.createStandardQuestion(
      standardId,
      moduleId,
      indicatorId,
      body,
    );
  }

  @Put(STANDARD_ROUTES.SEQUENCE)
  @ApiOperation({
    summary: 'Update sequence of modules / indicators / question sequences',
  })
  @ApiQuery({
    name: 'type',
    enum: StandardSequenceType,
    description: 'Type of sequence to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Sequence updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateModuleIndicatorSequence(
    @Param('standard_id') standardId: string,
    @Query('type') type: StandardSequenceType,
    @Body() body: UpdateSequenceDto,
  ): Promise<StandardResponse> {
    try {
      this.validateId(standardId, 'Standard ID');
      this.validateSequenceType(type);
      return await this.standardService.updateModuleIndicatorSequence(
        standardId,
        type,
        body.items,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  // @Get(`${STANDARD_ROUTES.STANDARD_ID}/modules`)
  // @ApiOperation({
  //   summary: 'Get standard by ID',
  //   description: 'Retrieves a standard by its unique identifier',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns the standard details',
  //   type: StandardResponseDto,
  // })
  // async getStandardByIdWithRelations(
  //   @Param('standard_id') standardId: string,
  // ): Promise<StandardResponseDto> {
  //   return await this.standardService._getStandardById(standardId);
  // }

  @Get(':indicator_id/questions')
  @ApiOperation({
    summary: 'Get standard by indicator ID',
    description: 'Retrieves a standard by its unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the standard details',
    type: StandardResponseDto,
  })
  async getStandardByIdWithRelationsAndQuestions(
    @Param('indicator_id') indicatorId: string,
  ): Promise<StandardResponseDto> {
    return await this.standardService._getStandardByIdWithQuestions(
      indicatorId,
    );
  }

  @Get(`${STANDARD_ROUTES.STANDARD_ID}/modules/:module_id`)
  @ApiOperation({
    summary: 'Get standard module by ID',
    description: 'Retrieves a standard module by its unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the standard details',
    type: StandardResponseDto,
  })
  async getStandardModuleById(
    @Param('standard_id') standardId: string,
    @Param('module_id') moduleId: string,
  ) {
    return await this.standardService.getStandardModuleById(
      standardId,
      moduleId,
    );
  }

  // Private validation methods
  private validateCreateStandardInput(file: any, body: StandardDto): void {
    if (!file) {
      throw new StandardError(
        'Please select a logo to upload',
        400,
        'MISSING_FILE',
      );
    }
    if (!body.name) {
      throw new StandardError('Standard name is required', 400, 'MISSING_NAME');
    }
  }

  private validateId(id: string, fieldName: string): void {
    if (!id) {
      throw new StandardError(`${fieldName} is required`, 400, 'MISSING_ID');
    }
  }

  private validateIds(ids: string[], fieldNames: string[]): void {
    ids.forEach((id, index) => {
      if (!id) {
        throw new StandardError(
          `${fieldNames[index]} is required`,
          400,
          'MISSING_ID',
        );
      }
    });
  }

  private validateStandardExists(
    standard: Standard | undefined,
    id: string,
  ): void {
    if (!standard) {
      throw new StandardError(
        `Standard with ID ${id} not found`,
        404,
        'NOT_FOUND',
      );
    }
  }

  private validateSequenceType(type: StandardSequenceType): void {
    if (!type) {
      throw new StandardError('Sequence type is required', 400, 'MISSING_TYPE');
    }
    if (!Object.values(StandardSequenceType).includes(type)) {
      throw new StandardError('Invalid sequence type', 400, 'INVALID_TYPE');
    }
  }

  private validatePaginationQuery(
    query: StandardQueryParams,
  ): StandardQueryParams {
    const { page = 1, limit = 10, sort = 'createdAt' } = query;
    return {
      ...query,
      page: Math.max(1, Number(page)),
      limit: Math.min(100, Math.max(1, Number(limit))),
      sort,
    };
  }

  private handleError(error: any): never {
    if (error instanceof StandardError) {
      throw error;
    }
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
