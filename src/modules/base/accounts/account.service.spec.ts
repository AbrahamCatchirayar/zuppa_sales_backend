import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { MailServiceRq } from '../../../mail/mail.service';
import { AdminUser } from '../users/user.entity';
import { ReasonDto } from './admin-account.dto';
import { MasterAccount } from './account.entity';
import { AdminAccountService } from './admin-account.service';

describe('UserService', () => {
  let service: AdminAccountService;
  let repository: Repository<MasterAccount>;
  let mailService: MailServiceRq;

  const reasonMock: ReasonDto = { reason: 'reason' };
  const userMock: AdminUser = { id: 'admin-id' } as any;

  const adminAccountmock = {
    findOne: jest.fn(),
  };
  const mockMasterAccountRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAccountService,
        {
          provide: getRepositoryToken(MasterAccount),
          useClass: Repository,
        },
        {
          provide: MailServiceRq,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AdminAccountService>(AdminAccountService);
    repository = module.get<Repository<MasterAccount>>(
      getRepositoryToken(MasterAccount),
    );
    mailService = module.get<MailServiceRq>(MailServiceRq);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find users depending on the param', async () => {
      const param = 'bfba6162-bcd8-4d14-b250-a1cd75552108' as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(param);
      await service.findOne(param);
      expect(repository.findOne).toHaveBeenCalledWith({ where: param });
    });
  });

  describe('findAll', () => {
    it('should apply status filter correctly', async () => {
      const mockData = [
        {
          email: 'sudan@coducer.com',
          name: 'sudan',
          status: 'active',
          createdBy: {},
        } as any,
      ];
      const mockTotalCount = 1;

      const mockQuery = {
        take: 10,
        skip: 0,
        order: {},
        relations: ['createdBy', 'blocked_by'],
        where: [{ status: ILike('active') }],
      };

      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([mockData, mockTotalCount]);

      const params = {
        limit: 10,
        skip: 0,
        page: 1,
        sort: {},
        filter: {
          status: 'active',
        },
      };

      const result = await service.findAll(params);

      expect(result.success).toBe(true);
      expect(result.accounts).toEqual(mockData);
      expect(result.meta.totalCount).toBe(mockTotalCount);
    });

    it('should apply dynamic filters (other than search/status)', async () => {
      const mockData = [
        {
          email: 'sudan@coducer.com',
          name: 'sudan',
          status: 'active',
          createdBy: {},
        } as any,
      ];
      const mockTotalCount = 1;

      const mockQuery = {
        take: 10,
        skip: 0,
        order: {},
        relations: ['createdBy', 'blocked_by'],
        where: [{ name: ILike('sudan') }, { status: ILike('active') }],
      };

      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([mockData, mockTotalCount]);

      const params = {
        limit: 10,
        skip: 0,
        page: 1,
        sort: {},
        filter: {
          name: 'sudan',
          status: 'active',
        },
      };

      const result = await service.findAll(params);

      expect(result.success).toBe(true);
      expect(result.accounts).toEqual(mockData);
      expect(result.meta.totalCount).toBe(mockTotalCount);
    });

    it('should apply both status and dynamic filters correctly', async () => {
      const mockData = [
        {
          email: 'sudan@coducer.com',
          name: 'sudan',
          status: 'active',
          createdBy: {},
        },
      ] as any;
      const mockTotalCount = 1;

      const mockQuery = {
        take: 10,
        skip: 0,
        order: {},
        relations: ['createdBy', 'blocked_by'],
        where: [{ name: ILike('sudan') }, { status: ILike('active') }],
      };

      jest
        .spyOn(repository, 'findAndCount')
        .mockResolvedValue([mockData, mockTotalCount]);

      const params = {
        limit: 10,
        skip: 0,
        page: 1,
        sort: {},
        filter: {
          name: 'sudan',
          status: 'active',
        },
      };

      const result = await service.findAll(params);

      expect(result.success).toBe(true);
      expect(result.accounts).toEqual(mockData);
      expect(result.meta.totalCount).toBe(mockTotalCount);
    });

    it('should throw a BadRequestException when an error occurs', async () => {
      const params = {
        limit: 10,
        skip: 0,
        page: 1,
        sort: {},
        filter: {
          search: 'sudan',
        },
      };

      jest
        .spyOn(repository, 'findAndCount')
        .mockRejectedValue(new Error('Database error'));

      try {
        await service.findAll(params);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('Database error');
      }
    });
  });

  describe('blockAccount', () => {
    it('should throw badrequest if account is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      try {
        await service.blockAccount(reasonMock, null, userMock, false);
      } catch (error) {
        expect(error.message).toBe('INVALID ACCOUNT ID');
      }
    });

    it('should throw the error if status is pending ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'PENDING',
        blocked_on: null,
        blocked_by: null,
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      try {
        await service.blockAccount(reasonMock, accountMock, userMock, false);
      } catch (error) {
        expect(error.message).toBe('CANT BLOCK PENDING ACCOUNT');
      }
    });

    it('should throw the message  if status is block ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'BLOCK',
        blocked_on: 20 / 11 / 2024,
        blocked_by: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(accountMock);
      try {
        await service.blockAccount(reasonMock, accountMock, userMock, false);
      } catch (error) {
        expect(error.message).toBe('ACCOUNT BLOCKED SUCCESSFULLY');
      }
    });
  });

  describe('unBlockAccount', () => {
    it('should throw badrequest if account is not found', async () => {
      const mockId = 'bfba6162-bcd8-4d14-b250-a1cd75552108';
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      try {
        await service.unBlockAccount(mockId, false);
      } catch (error) {
        expect(error.message).toBe('INVALID ACCOUNT ID');
      }
    });

    it('should throw the error if status is pending ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'PENDING',
        blocked_on: null,
        blocked_by: null,
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      try {
        await service.unBlockAccount(accountMock, false);
      } catch (error) {
        expect(error.message).toBe('ONLY BLOCKED ACCOUNT CAN BE UN-BLOCK');
      }
    });

    it('should throw this message if status is ACTIVE ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'BLOCK',
        blocked_on: null,
        blocked_by: null,
        blocked_reason: 'violating terms',
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      jest.spyOn(repository, 'save').mockResolvedValueOnce({
        ...accountMock,
        status: 'ACTIVE',
        blocked_by: null,
        blocked_on: null,
        blocked_reason: null,
      });
      try {
        await service.unBlockAccount(accountMock, false);
      } catch (error) {
        expect(error.message).toBe('ACCOUNT UN-BLOCKED SUCCESSFULLY');
      }
    });
  });

  describe('suspendAccount', () => {
    it('should throw badrequest if account is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      try {
        await service.blockAccount(reasonMock, null, userMock, true);
      } catch (error) {
        expect(error.message).toBe('INVALID ACCOUNT ID');
      }
    });

    it('should throw the error if status is pending ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'PENDING',
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      try {
        await service.blockAccount(reasonMock, accountMock, userMock, true);
      } catch (error) {
        expect(error.message).toBe('CANT SUSPEND PENDING ACCOUNT');
      }
    });

    it('should throw the message  if status is suspend ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'SUSPEND',
        suspended_on: new Date(),
        suspended_by: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        reasonMock: 'violates the rules',
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(accountMock);
      try {
        await service.blockAccount(reasonMock, accountMock, userMock, true);
      } catch (error) {
        expect(error.message).toBe('ADMIN SUSPEND SUCCESSFULLY');
      }
    });
  });

  describe('unSuspendAccount', () => {
    it('should throw badrequest if account is not found', async () => {
      const mockId = 'bfba6162-bcd8-4d14-b250-a1cd75552108';
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      try {
        await service.unBlockAccount(mockId, false);
      } catch (error) {
        expect(error.message).toBe('INVALID ACCOUNT ID');
      }
    });

    it('should throw the error if status is pending ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'PENDING',
        suspended_on: null,
        suspended_by: null,
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      try {
        await service.unBlockAccount(accountMock, true);
      } catch (error) {
        expect(error.message).toBe('ONLY SUSPENDED ACCOUNT CAN BE UNSUSPEND');
      }
    });

    it('should throw this message if status is ACTIVE ', async () => {
      const accountMock = {
        id: 'bfba6162-bcd8-4d14-b250-a1cd75552108',
        status: 'SUSPEND',
        suspended_on: null,
        suspended_by: null,
        reason: 'violating terms',
      } as any;
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(accountMock);
      jest.spyOn(repository, 'save').mockResolvedValueOnce({
        ...accountMock,
        status: 'ACTIVE',
        suspended_by: null,
        suspended_on: null,
        reason: null,
      });
      try {
        await service.unBlockAccount(accountMock, true);
      } catch (error) {
        expect(error.message).toBe('ACCOUNT UN-SUSPEND SUCCESSFULLY');
      }
    });
  });

  describe('invitation', () => {
    it('should throw error if account already exists', async () => {
      mockMasterAccountRepository.findOne.mockResolvedValueOnce(
        {} as MasterAccount,
      );
      const mockdata = {
        name: 'Test',
        account_name: 'Test Company',
        email: 'test@example.com',
        slug: 'test-slug',
        phone_number: '1234567890',
      };
      try {
        await service.inviteAccount(mockdata);
      } catch (error) {
        expect(error).toBe('Account Already Exists Please check your url');
      }
    });
  });
});
