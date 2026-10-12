import { Test, TestingModule } from '@nestjs/testing';
import { MasterQuestionService } from './question.service';
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';
import { QuestionType } from 'src/enum/questiontype.enum';
import { MasterQuestionsController } from './question.controller';

describe('MasterQuestionController', () => {
  let controller: MasterQuestionsController;
  let service: MasterQuestionService;

  const mockService = {
    createQuestion: jest.fn(),
    getAllQuestions: jest.fn(),
    getQuestionById: jest.fn(),
    updateQuestionById: jest.fn(),
    deleteQuestionById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterQuestionsController],
      providers: [
        {
          provide: MasterQuestionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MasterQuestionsController>(MasterQuestionsController);
    service = module.get<MasterQuestionService>(MasterQuestionService);
  });

  describe('createQuestion', () => {
    it('should create a question', async () => {
      const createQuestionDto: CreateQuestionDto = {
        indicator_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Question',
        description: 'Test Description',
        question_type: QuestionType.SINGLE_SELECT,
        place_holder: 'Select an option',
        options: [
          { id: 'option-1', text: 'Option 1', value: 'option_1' },
          { id: 'option-2', text: 'Option 2', value: 'option_2' },
        ],
      };

      const expectedResult = {
        success: true,
        message: 'Question created successfully',
        data: {
          id: 'question-id',
          ...createQuestionDto,
        },
      };

      mockService.createQuestion.mockResolvedValue(expectedResult);

      const result = await controller.createQuestion(createQuestionDto);

      expect(result).toEqual(expectedResult);
      expect(mockService.createQuestion).toHaveBeenCalledWith(createQuestionDto, 'indicator-id');
    });
  });

  describe('listAllQuestions', () => {
    it('should return all questions with pagination', async () => {
      const queryParams = {
        page: 1,
        limit: 10,
        filter: {},
      };

      const expectedResult = {
        success: true,
        questions: [
          {
            id: 'question-1',
            title: 'Question 1',
            description: 'Description 1',
            question_type: QuestionType.TEXT,
          },
          {
            id: 'question-2',
            title: 'Question 2',
            description: 'Description 2',
            question_type: QuestionType.SINGLE_SELECT,
          },
        ],
        meta: {
          currentCount: 2,
          currentPage: 1,
          currentLimit: 10,
          totalCount: 2,
        },
      };

      mockService.getAllQuestions.mockResolvedValue(expectedResult);

      const result = await controller.listAllQuestions(queryParams);

      expect(result).toEqual(expectedResult);
      expect(mockService.getAllQuestions).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('getQuestionById', () => {
    it('should return a question by id', async () => {
      const questionId = 'question-id';
      const expectedResult = {
        success: true,
        question: {
          id: questionId,
          title: 'Test Question',
          description: 'Test Description',
          question_type: QuestionType.TEXT,
        },
      };

      mockService.getQuestionById.mockResolvedValue(expectedResult);

      const result = await controller.getQuestionById(questionId);

      expect(result).toEqual(expectedResult);
      expect(mockService.getQuestionById).toHaveBeenCalledWith(questionId);
    });
  });

  describe('updateQuestionById', () => {
    it('should update a question', async () => {
      const questionId = 'question-id';
      const indicatorId = 'indicator-id';
      const updateData: UpdateQuestionDto = {
        title: 'Updated Question',
        description: 'Updated Description',
        question_type: QuestionType.SINGLE_SELECT,
        place_holder: 'Select an option',
        options: [
          { id: 'option-1', text: 'Option 1', value: 'option_1' },
          { id: 'option-2', text: 'Option 2', value: 'option_2' },
        ],
      };

      const expectedResult = {
        success: true,
        message: 'Question updated successfully',
      };

      mockService.updateQuestionById.mockResolvedValue(expectedResult);

      const result = await controller.updateQuestionById(questionId, updateData);

      expect(result).toEqual(expectedResult);
      expect(mockService.updateQuestionById).toHaveBeenCalledWith(questionId, updateData);
    });
  });

  describe('deleteQuestionById', () => {
    it('should delete a question', async () => {
      const questionId = 'question-id';
      const indicatorId = 'indicator-id';
      const expectedResult = {
        success: true,
        message: 'Question deleted successfully',
      };

      mockService.deleteQuestionById.mockResolvedValue(expectedResult);

      const result = await controller.deleteQuestionById(questionId);

      expect(result).toEqual(expectedResult);
      expect(mockService.deleteQuestionById).toHaveBeenCalledWith(questionId);
    });
  });
}); 