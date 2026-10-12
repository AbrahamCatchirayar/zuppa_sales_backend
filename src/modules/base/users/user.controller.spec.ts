import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserController } from './user.controller';
import { AdminUserService } from './user.service';
import { BadRequestException } from '@nestjs/common';

describe('AdminUserController', () => {
  let controller: AdminUserController;
  let service: AdminUserService;

  const mockAdminUserService = {
    invite: jest.fn(),
    changePassword: jest.fn(),
    updateAdmin: jest.fn(),
    updateAdminMember: jest.fn(),
    blockAdmin: jest.fn(),
    unBlockAdmin: jest.fn(),
    delete: jest.fn(),
    findAllAdmins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        {
          provide: AdminUserService,
          useValue: mockAdminUserService,
        },
      ],
    }).compile();

    controller = module.get<AdminUserController>(AdminUserController);
    service = module.get<AdminUserService>(AdminUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Invite', () => {
    it('should return passed params and user id', async () => {
      const mockInvitationAdminDto = {
        first_name: 'mohamed',
        last_name: 'shabin',
        email: 'shabin@gmail.com',
        role: 'ADMIN',
      };
      const user = { id: 'kjsd', name: 'shabin' };
      await controller.inviteAdmin(mockInvitationAdminDto, user);
      expect(service.invite).toHaveBeenCalledWith(
        mockInvitationAdminDto,
        user.id,
      );
    });
  });

  describe('change password', () => {
    it('should return passed params and user', async () => {
      const mockChangeAdminPasswordDto = {
        oldPassword: 'root@123',
        password: 'root@111',
        password_confirmation: 'root@111',
      };
      const user = { id: 'kjsd', name: 'shabin' };
      await controller.changePassword(mockChangeAdminPasswordDto, user);
      expect(service.changePassword).toHaveBeenCalledWith(
        user.id,
        mockChangeAdminPasswordDto,
      );
    });
  });

  describe('Update', () => {
    it('should Update Admin', async () => {
      const mockUpdateAdminUserDto = {
        first_name: 'muhammed',
        last_name: 'shabin',
      };
      const user = { id: 'kjsd', name: 'shabin' };
      await controller.update(mockUpdateAdminUserDto, user);
      expect(service.updateAdmin).toHaveBeenCalledWith(
        user.id,
        mockUpdateAdminUserDto,
      );
    });
  });

  describe('Update Admin User', () => {
    it('should Update the admin member', async () => {
      const mockInvitationAdminDto = {
        first_name: 'sudan',
        last_name: 'MD',
      };
      const id = 'sjdlfjsd';
      await controller.updateAdminUser(id, mockInvitationAdminDto);
      expect(service.updateAdminMember).toHaveBeenCalledWith(
        id,
        mockInvitationAdminDto,
      );
    });
  });

  describe('Block Admin ', () => {
    it('should return passed params and user id successfully', async () => {
      const mockReason = {
        blocked_reason: 'string',
      };
      const id = 'sjdlfjsd';
      const user = { id: 'kjsd', name: 'shabin' };
      await controller.blockAdmin(user, id, mockReason);
      expect(service.blockAdmin).toHaveBeenCalledWith(id, mockReason);
    });

    it('should Bad Request Exception return passed params and user id', async () => {
      const mockReason = {
        blocked_reason: 'string',
      };
      const id = 'sjdlfjsd';
      const user = { id: 'sjdlfjsd', name: 'shabin' };
      await expect(controller.blockAdmin(user, id, mockReason)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('UnBlock Admin', () => {
    it('should return passed Id successfully', async () => {
      const mockId = 'jasdflji';
      await controller.unblockAdmin(mockId);
      expect(service.unBlockAdmin).toHaveBeenCalledWith(mockId);
    });
  });

  describe('Get Admins', () => {
    it('should return admin', async () => {
      const mockAdminFilters = {
        page: 6,
        limit: 10,
        sort: 'sha',
        search: 'mu',
      };
      await controller.getAdmins(mockAdminFilters);
      expect(service.findAllAdmins).toHaveBeenCalledWith(mockAdminFilters);
    });
  });
});
