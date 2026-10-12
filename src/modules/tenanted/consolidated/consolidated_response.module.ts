import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataCubeTask } from '../datacubes/task/task.entity';
import { TaskModule } from '../datacubes/task/task.module';
import { TaskQuestion } from '../datacubes/task/task_questions.entity';
import { TaskQuestionAnswer } from '../datacubes/task/task_question_answer.entity';
import { AllResponse } from './allresponse.entity';
import { ConsolidatedResponse } from './consolidated_response.entity';
import { ConsolidatedResponseService } from './consolidated_response.service';
// import { Responses } from "./responses.dto";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConsolidatedResponse,
      AllResponse,
      DataCubeTask,
      TaskQuestion,
      TaskQuestionAnswer,
    ]),
    forwardRef(() => TaskModule),
  ],
  controllers: [],
  providers: [ConsolidatedResponseService],
  exports: [ConsolidatedResponseService],
})
export class ConsolidatedResponseModule {}
