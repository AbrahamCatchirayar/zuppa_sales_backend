import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionType } from 'src/enum/questiontype.enum';
import { DataSource, Repository } from 'typeorm';
import { Indicator } from '../indicators/indicator.entity';
import { Module } from '../modules/module.entity';
import { CreateQuestionDto } from './question.dto';
import { Question } from './question.entity';
import { MasterQuestionService } from './question.service';
import { QuestionOption } from './question_option.entity';

describe('MasterQuestionService', () => {
  let service: MasterQuestionService;
  let questionRepository: Repository<Question>;
  let indicatorRepository: Repository<Indicator>;
  let questionOptionRepository: Repository<QuestionOption>;
  let dataSource: DataSource;

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          save: jest.fn(),
        }),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MasterQuestionService,
        {
          provide: getRepositoryToken(Question),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Indicator),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(QuestionOption),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MasterQuestionService>(MasterQuestionService);
    questionRepository = module.get<Repository<Question>>(getRepositoryToken(Question));
    indicatorRepository = module.get<Repository<Indicator>>(getRepositoryToken(Indicator));
    questionOptionRepository = module.get<Repository<QuestionOption>>(getRepositoryToken(QuestionOption));
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('createQuestion', () => {
    const mockModule: Partial<Module> = {
      id: 'module-id',
      name: 'Test Module',
      description: 'Test Module Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      is_deleted: false,
      deleted_at: null,
    };

    const mockIndicator: Partial<Indicator> = {
      id: 'indicator-id',
      name: 'Test Indicator',
      description: 'Test Description',
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      is_deleted: false,
      deleted_at: null,
    };

    const mockQuestion: Partial<Question> = {
      id: 'question-id',
      title: 'Test Question',
      description: 'Test Description',
      question_type: QuestionType.SINGLE_SELECT,
      placeholder: 'Select an option',
      indicator: mockIndicator as Indicator,
      options: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      is_deleted: false,
      deleted_at: null,
    };

    const mockOptions: Partial<QuestionOption>[] = [
      { id: 'option-1', text: 'Option 1', value: 'option_1' },
      { id: 'option-2', text: 'Option 2', value: 'option_2' },
    ];

    it('should create a question successfully', async () => {
      const createQuestionDto: CreateQuestionDto = {
        indicator_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Question',
        description: 'Test Description',
        question_type: QuestionType.SINGLE_SELECT,
        place_holder: 'Select an option',
        options: mockOptions as QuestionOption[],
      };

      jest.spyOn(indicatorRepository, 'findOne').mockResolvedValue(mockIndicator as Indicator);
      jest.spyOn(questionRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(questionRepository, 'save').mockResolvedValue(mockQuestion as Question);

      const result = await service.createQuestion(createQuestionDto);

      expect(result).toEqual({
        success: true,
        message: 'Question created successfully',
        data: mockQuestion,
      });
    });

    it('should throw BadRequestException if indicator is invalid', async () => {
      const createQuestionDto: CreateQuestionDto = {
        indicator_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Question',
        description: 'Test Description',
        question_type: QuestionType.SINGLE_SELECT,
        place_holder: 'Select an option',
        options: mockOptions as QuestionOption[],
      };

      jest.spyOn(indicatorRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createQuestion(createQuestionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if question title already exists', async () => {
      const createQuestionDto: CreateQuestionDto = {
        indicator_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Question',
        description: 'Test Description',
        question_type: QuestionType.SINGLE_SELECT,
        place_holder: 'Select an option',
        options: mockOptions as QuestionOption[],
      };

      jest.spyOn(indicatorRepository, 'findOne').mockResolvedValue(mockIndicator as Indicator);
      jest.spyOn(questionRepository, 'findOne').mockResolvedValue(mockQuestion as Question);

      await expect(service.createQuestion(createQuestionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if select type question has no options', async () => {
      const createQuestionDto: CreateQuestionDto = {
        indicator_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Question',
        description: 'Test Description',
        question_type: QuestionType.SINGLE_SELECT,
        place_holder: 'Select an option',
        options: [],
      };

      jest.spyOn(indicatorRepository, 'findOne').mockResolvedValue(mockIndicator as Indicator);
      jest.spyOn(questionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createQuestion(createQuestionDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllQuestions', () => {
    it('should return paginated questions', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: 'question-1',
          title: 'Question 1',
          description: 'Description 1',
          question_type: QuestionType.TEXT,
          placeholder: 'Enter text',
          indicator: null,
          options: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          is_deleted: false,
          deleted_at: null,
        },
        {
          id: 'question-2',
          title: 'Question 2',
          description: 'Description 2',
          question_type: QuestionType.SINGLE_SELECT,
          placeholder: 'Select an option',
          indicator: null,
          options: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          is_deleted: false,
          deleted_at: null,
        },
      ];

      jest.spyOn(questionRepository, 'findAndCount').mockResolvedValue([mockQuestions as Question[], 2]);

      const result = await service.getAllQuestions({
        page: 1,
        limit: 10,
        filter: {},
      });

      expect(result).toEqual({
        success: true,
        questions: mockQuestions,
        meta: {
          currentCount: 2,
          currentPage: 1,
          currentLimit: 10,
          totalCount: 2,
        },
      });
    });
  });

  describe('getQuestionById', () => {
    it('should return a question by id', async () => {
      const mockQuestion: Partial<Question> = {
        id: 'question-id',
        title: 'Test Question',
        description: 'Test Description',
        question_type: QuestionType.TEXT,
        placeholder: 'Enter text',
        indicator: null,
        options: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        deleted_at: null,
      };

      jest.spyOn(questionRepository, 'findOne').mockResolvedValue(mockQuestion as Question);

      const result = await service.getQuestionById('question-id');

      expect(result).toEqual({
        success: true,
        question: mockQuestion,
      });
    });

    it('should throw BadRequestException if question not found', async () => {
      jest.spyOn(questionRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getQuestionById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
}); 