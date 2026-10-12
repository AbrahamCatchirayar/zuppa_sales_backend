import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import {
  Body,
  Delete,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt-gaurd';
import { IUser, UserDecorator } from 'src/modules/user.decorator';
import { multerOptionsAllKindFile, QUERY_PARAMS } from 'src/utils';
import { User } from '../../user/entities/user.entity';
import {
  ApproveTaskDto,
  BulkReassignTaskDto,
  BulkUploadDto,
  CreateDataCubeTaskDto,
  DeleteGroupQuestionDto,
  GroupQuestionDto,
  ReassignTaskDto,
  ResponseDto,
  ReviewTaskQuestionDto,
  TaskCommentsDto,
  TaskFiltersByUser,
  TaskFiltersDto,
  UpdateTaskResponseDto,
} from './task.dto';

import { TaskService } from './task.serivce';

@ApiTags('TASK')
@Controller('v1/task')
@ApiBearerAuth('USER')
@UseGuards(JwtAuthGuard)
@ApiHeader({
  name: 'x-tenant-id',
  required: true,
  description: 'API_KEY',
})
export class TaskContoller {
  constructor(private readonly taskService: TaskService) {}

  @Get('users')
  async getTaskByUser(
    @UserDecorator() user,
    @Query() query: TaskFiltersByUser,
  ) {
    const task = await this.taskService.getTaskByUser(
      user,
      QUERY_PARAMS({ ...query }),
    );
    return task;
  }

  @Get('')
  async getAllTasks(@Query() query: TaskFiltersDto) {
    const param = QUERY_PARAMS({
      ...query,
    });
    return await this.taskService.getAllTasks(param);
  }

  @Get('generate-template/:moduleId/:siteId')
  async generateExcel(
    @Param('siteId') siteId: string,
    @Param('moduleId') moduleId: string,
    @Query('datacubeIds') datacubeIds: string,
    @UserDecorator() user: User,
  ) {
    const datacubeIdArray = datacubeIds ? datacubeIds.split(',') : [];
    return this.taskService.generateTaskAnswerWorkbooks(
      siteId,
      moduleId,
      datacubeIdArray,
      user,
    );
  }

  @Get(':task_id/task_questions')
  async getTaskQuestions(
    @Param('task_id') task_id: string,
    @UserDecorator() users: IUser,
  ) {
    return await this.taskService.getTaskQuestionsList(task_id, users.id);
  }

  @Get('signed-url')
  @ApiOperation({ summary: 'Generate a signed URL for downloading a file' })
  @ApiQuery({
    name: 'url',
    required: true,
    description: 'The S3 URL of the file to generate a signed URL for',
  })
  async getSignedUrl(@Query('url') url: string) {
    return await this.taskService.getSignedUrl(url);
  }

  @Get(':task_id')
  async getTask(@Param('task_id') task_id: string) {
    return await this.taskService.getTaskById(task_id);
  }

  @Post()
  async createTask(
    @Body() body: CreateDataCubeTaskDto,
    @UserDecorator() user: User,
  ) {
    return await this.taskService.createDataCubeTask(body, user);
  }

  @Post('response')
  async createTaskResponse(@Body() body: ResponseDto) {
    return await this.taskService.createTaskResponse(body);
  }

  @Post('sheetResponse')
  async createTaskSheetResponse(
    // @Param('task_id') id: string,
    @Body() body: BulkUploadDto,
  ) {
    return await this.taskService.createTaskSheetResponse(body);
  }

  @Put(':task_question_answer_id/response')
  async updateTaskReponse(
    @Param('task_question_answer_id') id: string,
    @Body() body: UpdateTaskResponseDto,
  ) {
    return await this.taskService.updateTaskResponse(id, body);
  }

  @Put(':task_id/reassign')
  async reassignTask(
    @UserDecorator() user: User,
    @Param('task_id') id: string,
    @Body() body: ReassignTaskDto,
  ) {
    return await this.taskService.reassignTask(id, body, user);
  }

  @Put('reassign')
  @ApiOperation({ summary: 'Reassign single or multiple tasks' })
  async reassignTasks(
    @UserDecorator() user: User,
    @Body() body: BulkReassignTaskDto,
  ) {
    return await this.taskService.reassignTasks(body.task_ids, body, user);
  }

  @Put(':task_id/change_status')
  async changeTaskStatus(
    @UserDecorator() user: User,
    @Param('task_id') id: string,
    @Body() body: ApproveTaskDto,
  ) {
    return await this.taskService.changeTaskStatus(id, body, user);
  }

  // @Put('bulk/change_status')
  // async bulkChangeTaskStatus(
  //   @UserDecorator() user: IUser,
  //   @Body() body: { ids: string[], status: TaskStatus },
  // ) {
  //   return await this.taskService.bulkChangeTaskStatus(body.ids, body.status, user);
  // }

  @Put(':task_id/task_question/review')
  async reviewTaskQuestion(
    @Param('task_id') id: string,
    @Body() body: ReviewTaskQuestionDto,
  ) {
    return await this.taskService.reviewTaskQuestion(id, body);
  }

  @Post(':task_id/comments')
  async createTaskComments(
    @Param('task_id') id: string,
    @Body() body: TaskCommentsDto,
    @UserDecorator() user: User,
  ) {
    return await this.taskService.createTaskComments(id, body, user);
  }

  @Post(':task_id/group_question')
  async createGroupQuestion(
    @Param('task_id') id: string,
    @Body() body: GroupQuestionDto,
  ) {
    return await this.taskService.createGroupQuestion(id, body);
  }

  @Post('sheetanswer_upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('USER')
  @ApiOperation({
    summary: 'Upload a file and bulk data for task question answers',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        datacubeId: {
          type: 'string',
          example: '21f74641-3a22-42af-beab-de6a6b49370d',
        },
        moduleId: {
          type: 'string',
          example: '3e62e40b-a593-43d9-bb68-5d6590e21e04',
        },
        siteId: {
          type: 'string',
          example: 'ede71c53-bf82-4f53-9065-25a07df7f6de',
        },
        frequency: {
          type: 'object',
          example: {
            'October_2025-2026': [
              { questionUid: 'UID_927', answer: 'Sample answer' },
            ],
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptionsAllKindFile))
  async uploadSheetAnswerFile(
    @UserDecorator() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: BulkUploadDto | any, // allow temporary type flexibility
  ) {
    if (!file) {
      throw new BadRequestException('Please select a file to upload');
    }

    // ✅ Convert "frequency" to object if sent as JSON string
    if (typeof body.frequency === 'string') {
      try {
        body.frequency = JSON.parse(body.frequency);
      } catch {
        throw new BadRequestException('Invalid JSON for frequency');
      }
    }

    return this.taskService.uploadFileToTaskAnswers(body, user, file);
  }

  @Post('file_upload')
  @ApiBearerAuth('USER')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a file for task question answer' })
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
  @UseInterceptors(FileInterceptor('file', multerOptionsAllKindFile))
  async uploadFile(@UserDecorator() user: User, @UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('Please select a file to uploadfr');
      }

      // const fileExtension = path.extname(file.originalname).toLowerCase();

      // if (!allowedFileTypes.includes(fileExtension)) {
      //   throw new BadRequestException(
      //     'Invalid file type. Only Excel files (.xlsx, .xls) are allowed',
      //   );
      // }
      return this.taskService.uploadFileToTaskQuestionAnswer(user, file);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Delete(':task_id/group_question')
  async deleteGroupQuestion(
    @Param('task_id') id: string,
    @Body() body: DeleteGroupQuestionDto,
  ) {
    return await this.taskService.deleteGroupQuestion(id, body);
  }

  @Get('users/businessunit')
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by task status',
  })
  @ApiQuery({
    name: 'datacube_name',
    required: false,
    type: String,
    description: 'Filter by datacube name',
  })
  async getTasksByBusinessUnit(
    @UserDecorator() user: IUser,
    @Query('status') status?: string,
    @Query('datacube_name') datacube_name?: string,
  ) {
    return await this.taskService.getTasksByBusinessUnit(
      user,
      status,
      datacube_name,
    );
  }

  @Get('users/site/:site_id')
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by task status',
  })
  @ApiQuery({
    name: 'datacube_name',
    required: false,
    type: String,
    description: 'Filter by datacube name',
  })
  async getTasksBySiteId(
    @Param('site_id') site_id: string,
    @UserDecorator() user: IUser,
    @Query('status') status?: string,
    @Query('datacube_name') datacube_name?: string,
  ) {
    return await this.taskService.getTasksBySiteId(
      site_id,
      user,
      status,
      datacube_name,
    );
  }
}
