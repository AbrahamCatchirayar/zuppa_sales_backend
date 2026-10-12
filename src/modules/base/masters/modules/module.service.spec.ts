import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, BadGatewayException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ModuleService } from './module.service';
import { Module } from './module.entity';
import { Indicator } from '../indicators/indicator.entity';
import { ModuleCreationDto, ModuleUpdateDto } from './module.dto';

describe('ModuleService', () => {
  let service: ModuleService;
  let moduleRepository: Repository<Module>;
  let indicatorRepository: Repository<Indicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        {
          provide: getRepositoryToken(Module),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Indicator),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
    moduleRepository = module.get<Repository<Module>>(getRepositoryToken(Module));
    indicatorRepository = module.get<Repository<Indicator>>(getRepositoryToken(Indicator));
  });

  describe('createModule', () => {
    it('should create a module successfully', async () => {
      const createModuleDto: ModuleCreationDto = {
        name: 'Test Module',
        description: 'Test Description',
      };

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(moduleRepository, 'save').mockResolvedValue(createModuleDto as any);

      const result = await service.createModule(createModuleDto);

      expect(result).toEqual({
        success: true,
        message: 'Module created successfully',
      });
      expect(moduleRepository.findOne).toHaveBeenCalledWith({
        where: { name: createModuleDto.name },
      });
      expect(moduleRepository.save).toHaveBeenCalledWith(createModuleDto);
    });

    it('should throw BadGatewayException if module name already exists', async () => {
      const createModuleDto: ModuleCreationDto = {
        name: 'Test Module',
        description: 'Test Description',
      };

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue({
        id: 'existing-id',
        name: 'Test Module',
        description: 'Existing Description',
        masterIndicator: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        deleted_at: null,
      });

      await expect(service.createModule(createModuleDto)).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('getAllModules', () => {
    it('should return paginated modules', async () => {
      const queryParams = {
        page: 1,
        limit: 10,
        filter: {},
      };

      const mockModules = [
        {
          id: 'module-1',
          name: 'Module 1',
          description: 'Description 1',
          masterIndicator: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          is_deleted: false,
          deleted_at: null,
        },
        {
          id: 'module-2',
          name: 'Module 2',
          description: 'Description 2',
          masterIndicator: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          is_deleted: false,
          deleted_at: null,
        },
      ];

      jest.spyOn(moduleRepository, 'findAndCount').mockResolvedValue([mockModules, 2]);

      const result = await service.getAllModules(queryParams);

      expect(result).toEqual({
        success: true,
        modules: mockModules,
        meta: {
          currentCount: 2,
          currentPage: 1,
          currentLimit: 10,
          totalCount: 2,
        },
      });
    });
  });

  describe('getModule', () => {
    it('should return a module by id', async () => {
      const moduleId = 'module-id';
      const mockModule = {
        id: moduleId,
        name: 'Test Module',
        description: 'Test Description',
        masterIndicator: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        deleted_at: null,
      };

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(mockModule);

      const result = await service.getModule(moduleId);

      expect(result).toEqual({
        success: true,
        module: mockModule,
      });
    });

    it('should throw BadRequestException if module not found', async () => {
      const moduleId = 'invalid-id';

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getModule(moduleId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateModule', () => {
    it('should update a module successfully', async () => {
      const moduleId = 'module-id';
      const updateData: ModuleUpdateDto = {
        name: 'Updated Module',
        description: 'Updated Description',
      };

      const mockModule = {
        id: moduleId,
        name: 'Test Module',
        description: 'Test Description',
        masterIndicator: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        deleted_at: null,
      };

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(mockModule);
      jest.spyOn(moduleRepository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateModule(moduleId, updateData);

      expect(result).toEqual({
        success: true,
        message: 'Module updated successfully',
      });
    });

    it('should throw BadRequestException if module not found', async () => {
      const moduleId = 'invalid-id';
      const updateData: ModuleUpdateDto = {
        name: 'Updated Module',
        description: 'Updated Description',
      };

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateModule(moduleId, updateData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteModule', () => {
    it('should delete a module successfully', async () => {
      const moduleId = 'module-id';
      const mockModule = {
        id: moduleId,
        name: 'Test Module',
        description: 'Test Description',
        masterIndicator: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: false,
        deleted_at: null,
      };

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(mockModule);
      jest.spyOn(indicatorRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(moduleRepository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteModule(moduleId);

      expect(result).toEqual({
        success: true,
        message: 'Module deleted Successfully',
      });
    });

    it('should throw BadRequestException if module not found', async () => {
      const moduleId = 'invalid-id';

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteModule(moduleId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if module already deleted', async () => {
      const moduleId = 'module-id';
      const mockModule = {
        id: moduleId,
        name: 'Test Module',
        description: 'Test Description',
        masterIndicator: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        is_deleted: true,
        deleted_at: new Date(),
      };

      jest.spyOn(moduleRepository, 'findOne').mockResolvedValue(mockModule);

      await expect(service.deleteModule(moduleId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
}); 