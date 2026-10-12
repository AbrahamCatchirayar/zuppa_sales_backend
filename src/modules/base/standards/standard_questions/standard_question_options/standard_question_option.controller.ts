import { Controller } from '@nestjs/common';
import { StandardQuestionOptionService } from './standard_question_option.service';

@Controller('standard_question_option')
export class StandardQuestionOptionController {
  constructor(
    private readonly standardQuestionOptionService: StandardQuestionOptionService,
  ) {}
}
