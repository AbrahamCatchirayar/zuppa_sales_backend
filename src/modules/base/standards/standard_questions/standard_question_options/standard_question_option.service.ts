import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StandardQuestionOption } from './standard_question_option.entity';

@Injectable()
export class StandardQuestionOptionService {
  constructor(
    @InjectRepository(StandardQuestionOption)
    private readonly standardQuestionsOptionModel: Repository<StandardQuestionOption>,
  ) {}
}
