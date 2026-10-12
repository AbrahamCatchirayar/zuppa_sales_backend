import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/jwt/jwt-gaurd';
import {
  CreateQuestionRulesDto,
  GroupQuestionsDto,
  QuestionsRemove,
  RemoveQuestionRulesDto,
} from './standard_question.dto';
import { StandardQuestionService } from './standard_question.service';

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
@ApiTags('STANDARD_QUESTIONS')
@ApiBearerAuth('ADMIN')
@Controller('admin')
@UseGuards(JwtAdminAuthGuard)
export class StandardQuestionController {
  constructor(
    private readonly standardQuestionService: StandardQuestionService,
  ) {}

  @Delete(
    'standard/:standard_id/standard_modules/:module_id/standard_indicators/:indicator_id/questions',
  )
  async removeQuestions(
    @Param('standard_id') standardId: string,
    @Param('module_id') moduleId: string,
    @Param('indicator_id') indicatorId: string,
    @Body() body: QuestionsRemove,
  ) {
    const question = await this.standardQuestionService.removeQuestions(
      standardId,
      moduleId,
      indicatorId,
      body,
    );
    return question;
  }

  @Post(
    'standard/:standard_id/standard_modules/:module_id/standard_indicators/:indicator_id/question_rules',
  )
  @ApiOperation({
    summary: 'create question rules ',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createQuestionRules(
    @Param('standard_id') standardId: string,
    @Param('module_id') moduleId: string,
    @Param('indicator_id') indicatorId: string,
    @Body() body: CreateQuestionRulesDto,
  ) {
    try {
      return await this.standardQuestionService.createQuestionRules(
        standardId,
        moduleId,
        indicatorId,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(
    'standard/:standard_id/standard_modules/:module_id/standard_indicators/:indicator_id/question_sequences/:question_sequence_id/question_rules',
  )
  async removeQuestionRules(
    @Param('standard_id') standardId: string,
    @Param('module_id') moduleId: string,
    @Param('indicator_id') indicatorId: string,
    @Param('question_sequence_id') quesitonSequenceId: string,
    @Body() body: RemoveQuestionRulesDto,
  ) {
    try {
      return await this.standardQuestionService.removeQuestionRules(
        standardId,
        moduleId,
        indicatorId,
        quesitonSequenceId,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(
    'standard/:standard_id/standard_modules/:module_id/standard_indicators/:indicator_id/group_questions',
  )
  async groupQuestions(
    @Param('standard_id') standardId: string,
    @Param('module_id') moduleId: string,
    @Param('indicator_id') indicatorId: string,
    @Body() body: GroupQuestionsDto,
  ) {
    try {
      return await this.standardQuestionService.groupQuestions(
        standardId,
        moduleId,
        indicatorId,
        body,
      );
    } catch (error) {
      this.handleError(error);
    }
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
