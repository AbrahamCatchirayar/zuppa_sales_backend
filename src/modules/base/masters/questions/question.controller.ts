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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import { multerOptionsFile, QUERY_PARAMS } from 'src/utils';
import * as path from 'path';
import {
  CreateQuestionDto,
  MasterQuestionFilter,
  QuestionOptionsDeleteDto,
  UpdateQuestionDto,
} from './question.dto';
import { MasterQuestionService } from './question.service';

@ApiTags('Master - QuestionBank')
@Controller('admin')
@ApiBearerAuth('ADMIN')
@UseGuards(JwtAdminAuthGuard)
export class MasterQuestionsController {
  constructor(private readonly questionModel: MasterQuestionService) {}

  @Get('questions')
  async listAllQuestions(@Query() query: MasterQuestionFilter) {
    const question = await this.questionModel.getAllQuestions(
      QUERY_PARAMS({ ...query }),
    );
    return question;
  }

  @Post('/questions')
  async createQuestion(@Body() body: CreateQuestionDto) {
    const question = await this.questionModel.createQuestion(body);
    return question;
  }

  @Put('/questions/:id')
  async updateQuestionById(
    @Param('id') questionId: string,
    @Body() params: UpdateQuestionDto,
  ) {
    const updatedQuestion = await this.questionModel.updateQuestionById(
      questionId,
      params,
    );
    return updatedQuestion;
  }

  @Get('/questions/:id')
  async getQuestionById(@Param('id') questionId: string) {
    const question = await this.questionModel.getQuestionById(questionId);
    return question;
  }

  @Delete('/questions/:id')
  async deleteQuestionById(@Param('id') qustionId: string) {
    const deletedQuestion =
      await this.questionModel.deleteQuestionById(qustionId);
    return deletedQuestion;
  }

  @Post('upload-excel')
  @ApiOperation({ summary: 'Upload Excel File' })
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
  @UseInterceptors(FileInterceptor('file', multerOptionsFile))
  async uploadExcel(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedFileTypes = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (!allowedFileTypes.includes(fileExtension)) {
      throw new BadRequestException(
        'Invalid file type. Only Excel files (.xlsx, .xls) are allowed',
      );
    }

    return this.questionModel.processExcelFile(file);
  }

  @ApiOperation({
    summary: 'Delete question options for the question',
  })
  @ApiResponse({
    status: 200,
    description: 'Question options deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @Delete('/questions/:id/options')
  async deleteOptionsByQuestionId(
    @Param('id') questionId: string,
    @Body() body: QuestionOptionsDeleteDto,
  ) {
    const question = await this.questionModel.softDeleteOptionsByQuestionId(
      questionId,
      body,
    );
    return question;
  }
}
