import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuestionSequenceService } from './question_sequence.service';
import { CreateQuestionSequenceDto } from './question_sequence.dto';

@Controller('admin')
@ApiTags('Question Sequence')
export class QuestionSequenceController {
  constructor(
    private readonly questionSequenceService: QuestionSequenceService,
  ) {}

  // @Post(
  //   '/standards/:standardId/modules/:moduleId/indicators/:indicatorId/question_sequence',
  // )
  // async createQuestionSequence(
  //   @Param('standardId') standardId: string,
  //   @Param('moduleId') moduleId: string,
  //   @Param('indicatorId') indicatorId: string,
  //   @Body() body: CreateQuestionSequenceDto,
  // ) {
  //   const res = await this.questionSequenceService.createQuestionSequence(
  //     standardId,
  //     moduleId,
  //     indicatorId,
  //     body,
  //   );
  //   return res;
  // }

  @Get(
    'standards/:standardId/modules/:moduleId/indicators/:indicatorId/question_sequences',
  )
  async getQuestionSequencesByIndicatorId(
    @Param('indicatorId') indicatorId: string,
    @Param('standardId') standardId: string,
    @Param('moduleId') moduleId: string,
  ) {
    const res =
      await this.questionSequenceService.getQuestionSequencesByIndicatorId(
        standardId,
        moduleId,
        indicatorId,
      );
    return res;
  }

  // @Delete(
  //   'standards/:standardId/modules/:moduleId/indicators/:indicatorId/question_sequence/:questionSequenceId',
  // )
  // async deleteQuestionSequence(
  //   @Param('standardId') standardId: string,
  //   @Param('moduleId') moduleId: string,
  //   @Param('indicatorId') indicatorId: string,
  //   @Param('questionSequenceId') questionSequenceId: string,
  // ) {
  //   const res = await this.questionSequenceService.deleteQuestionSequence(
  //     standardId,
  //     moduleId,
  //     indicatorId,
  //     questionSequenceId,
  //   );
  //   return res;
  // }
}
