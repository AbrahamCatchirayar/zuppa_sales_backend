import { Test, TestingModule } from '@nestjs/testing';
import { AdminUser } from '../users/user.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { FilterQuery, InviteAccountDto } from './account.dto';

describe('UserService', () => {
  let controller: AccountController;
  let service: AccountService;

  let mockFunctions = {
    findAll: jest.fn(),
    inviteAccount: jest.fn(),
    blockAccount: jest.fn(),
    unBlockAccount: jest.fn(),
    suspend: jest.fn(),
    unsuspend: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountController,
        { provide: AccountService, useValue: mockFunctions },
      ],
    }).compile();
    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllAccount', () => {
    it('should call findAll with correct parameters', async () => {
      const mockData: FilterQuery = {
        limit: 10,
        page: 1,
        sort: '-1',
      };
      const param = {
        limit: 10,
        page: 1,
        filter: {},
        skip: 0,
        sort: { '1': -1 },
      };
      await controller.getAllTenentAccounts(mockData);
      expect(mockFunctions.findAll).toHaveBeenCalledWith(param);
    });
  });

  describe('invite', () => {
    it('should inivite a user', async () => {
      const mockdata: InviteAccountDto = {
        slug: 'sudan',
        email: 'sudan@coducer.com',
        name: 'sudan',
        phone_number: '+919876543210',
        account_name: 'coducer',
      };
      await controller.inviteTenentAccount(mockdata);
      expect(mockFunctions.inviteAccount).toHaveBeenCalledWith(mockdata);
    });
  });

  describe('blockById', () => {
    it('should block a user by Id', async () => {
      const mockReason = 'sdoeisdfosifefsene eoeiwen' as any;
      const mockId = 'testid';
      const userMock: AdminUser = { id: 'admin-id' } as AdminUser;
      try {
        await controller.blockAccount(mockReason, mockId, userMock);
      } catch (error) {
        expect(mockFunctions.blockAccount).toHaveBeenCalledWith(
          mockReason,
          mockId,
          userMock,
        );
      }
    });
  });

  describe('UnBlockById', () => {
    it('should unblock a user by Id', async () => {
      const mockId = 'testid';
      try {
        await controller.unblockAccount(mockId);
      } catch (error) {
        expect(mockFunctions.unBlockAccount).toHaveBeenCalledWith(mockId);
      }
    });
  });

  describe('suspend', () => {
    it('should suspend the user by id', async () => {
      const mockReason = 'sdoeisdfosifefsene eoeiwen' as any;
      const mockId = '6c9cc090-e7ef-417a-ad15-640669104332';
      const userMock: AdminUser = {
        id: '6c9cc090-e7ef-417a-ad15-640669104332',
      } as AdminUser;
      try {
        await controller.suspend(mockReason, mockId, userMock);
      } catch (error) {
        expect(mockFunctions.suspend).toHaveBeenCalledWith(
          mockReason,
          mockId,
          userMock,
        );
      }
    });
  });

  describe('unSuspend', () => {
    it('should unsuspend a user by Id', async () => {
      const _mockId = '6c9cc090-e7ef-417a-ad15-640669104332';
      try {
        await controller.unsuspend(_mockId);
      } catch (error) {
        expect(mockFunctions.unsuspend).toHaveBeenCalledWith(_mockId);
      }
    });
  });
});
