import { ILike, Repository } from 'typeorm';
import { MailServiceRq } from '../../../mail/mail.service';
import { AdminUser } from './user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as CONFIG from '../../../config.json';
import { BadRequestException } from '@nestjs/common';
import { comparePassword } from '../../../utils';
import * as bcrypt from 'bcryptjs';
import * as utils from '../../../utils';

jest.mock('../../../utils', () => ({
  tokenGenerator: jest.fn(() => 'mock-token'),
}));

jest.mock('../../../utils', () => ({
  comparePassword: jest.fn(),
}));

describe('AdminUserService', () => {
  let service: AdminUserService;
  let adminUserModel: Repository<AdminUser>;
  let mailService: MailServiceRq;

  const mockAdminUserModel = {
    count: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findAndCount: jest.fn(),
  };
  const mockRoleService = { init: jest.fn() };
  const mockMailService = { send: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUserService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: mockAdminUserModel,
        },
        { provide: MailServiceRq, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AdminUserService>(AdminUserService);
    adminUserModel = module.get<Repository<AdminUser>>(
      getRepositoryToken(AdminUser),
    );
    mailService = module.get<MailServiceRq>(MailServiceRq);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('On module Init', () => {
    it('should return some values', async () => {
      mockRoleService.init.mockResolvedValue(undefined);
      mockAdminUserModel.count.mockResolvedValue(0);
      mockAdminUserModel.save.mockResolvedValue({ id: 'superadmin' });
      await service.onModuleInit();
      expect(mockRoleService.init).toHaveBeenCalledWith();
      expect(mockAdminUserModel.count).toHaveBeenCalledWith();
      expect(mockAdminUserModel.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: CONFIG.SUPERADMIN.email,
          confirmed_at: expect.any(Date),
        }),
      );
    });
  });

  describe('Get Super Admin', () => {
    it('should return true or false', async () => {
      expect(mockAdminUserModel.count.mockResolvedValue(1));
      await service.getSuperAdmin();
      expect(mockAdminUserModel.count).toHaveBeenCalledWith();
    });
    it('should return true or false', async () => {
      expect(mockAdminUserModel.count.mockResolvedValue(0));
      await service.getSuperAdmin();
      expect(mockAdminUserModel.count).toHaveBeenCalledWith();
    });
  });

  describe('create User', () => {
    it('should create super admin', async () => {
      const userMock = { id: 'kjsdf', name: 'shabin' };
      mockAdminUserModel.save.mockResolvedValue(userMock);
      await service.createUser(userMock);
      expect(mockAdminUserModel.save).toHaveBeenCalledWith(
        expect.any(AdminUser),
      );
    });
  });

  describe('find One', () => {
    it('should find one admin ', async () => {
      const param = { id: 'kjsdf', name: 'shabin' };
      mockAdminUserModel.findOne.mockResolvedValue(param);
      await service.findOne(param);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        where: param,
        select: null,
        relations: ['role'],
      });
    });
  });

  describe('update user', () => {
    it('should update the payload and condition ', async () => {
      const conditionMock = { id: 'kjsdf', name: 'shabin' };
      const payloadMock = { id: 'kjsdf', name: 'shabin' };
      mockAdminUserModel.update.mockResolvedValue(1);
      await service.updateUser(conditionMock, payloadMock);
      expect(mockAdminUserModel.update).toHaveBeenCalledWith(
        conditionMock,
        payloadMock,
      );
    });
  });
  describe('forgot password', () => {
    it('should  ', async () => {
      // const mockEmail = 'shabin@gmail.com';
      mockAdminUserModel.findOne.mockResolvedValue(null);
      await expect(
        service.forgetPassword('nonexistent@example.com'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.forgetPassword('nonexistent@example.com'),
      ).rejects.toThrow('USER NOT FOUND');
    });
    it('should generate a token, save the user, and send a mail', async () => {
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      };
      mockAdminUserModel.findOne.mockResolvedValue(user);
      mockAdminUserModel.save.mockResolvedValue(user);
      mockMailService.send.mockResolvedValue(undefined);
      const result = await service.forgetPassword('test@example.com');
      expect(adminUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(utils.tokenGenerator).toHaveBeenCalled();
      expect(adminUserModel.save).toHaveBeenCalledWith(
        expect.objectContaining({
          forget_password_token: 'mock-token',
          forget_password_token_sent_at: expect.any(Date),
        }),
      );
      expect(mailService.send).toHaveBeenCalledWith('admin-forgot_password', {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        token: 'mock-token',
      });
      expect(result).toEqual({
        success: true,
        message: 'Please check your mail for reset password link',
      });
    });
  });

  describe('Reset Password', () => {
    it('should BadRequestException if not user', async () => {
      const mockResetPasswordDto = {
        token: 'jasdlbf',
        password: 'Password@123',
        passwordConfirmation: 'Password@123',
      };
      mockAdminUserModel.findOne.mockResolvedValue(0);
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should BadRequestException if password is not same', async () => {
      const mockResetPasswordDto = {
        token: 'jasdlbf',
        password: 'Password@123',
        passwordConfirmation: 'Password@111',
      };
      mockAdminUserModel.findOne.mockResolvedValue(1);
      await expect(service.resetPassword(mockResetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reset the password', async () => {
      const mockResetPasswordDto = {
        token: 'jasdlbf',
        password: 'Password@123',
        passwordConfirmation: 'Password@123',
      };
      const user = {
        token: 'jasdlbf',
        password: true,
        passwordConfirmation: 'Password@123',
        forget_password_token: null,
        password_reset_on: new Date(),
      };

      mockAdminUserModel.findOne.mockResolvedValue(mockResetPasswordDto);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(true);
      mockAdminUserModel.save.mockResolvedValue(user);
      await service.resetPassword(mockResetPasswordDto);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        where: { forget_password_token: mockResetPasswordDto.token },
      });
      expect(mockAdminUserModel.save).toHaveBeenCalledWith(user);
    });
  });
  describe('Accept Invitation', () => {
    const mockToken = 'sbkdabcksj';
    const mockAdminUserDto = {
      password: 'string',
      confirm_password: 'string',
      phone_number: 'string',
      accept_terms_and_conditions: true,
      first_name: 'string',
      last_name: 'string',
    };
    it('should BadRequestException if not user', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(0);
      await expect(
        service.acceptInvitation(mockToken, mockAdminUserDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should BadRequestException if password is not same ', async () => {
      const mockToken = 'sbkdabcksj';
      const mockAdminUserDto = {
        password: 'string',
        confirm_password: 'string123',
        phone_number: 'string',
        accept_terms_and_conditions: true,
        first_name: 'string',
        last_name: 'string',
      };
      mockAdminUserModel.findOne.mockResolvedValue(1);
      await expect(
        service.acceptInvitation(mockToken, mockAdminUserDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should', async () => {
      const mockAdminUserDto = {
        password: 'string',
        confirm_password: 'string',
        phone_number: 'string',
        accept_terms_and_conditions: true,
        first_name: 'string',
        last_name: 'string',
      };
      const user = {
        password: true,
        confirm_password: 'string',
        phone_number: 'string',
        accept_terms_and_conditions: true,
        accept_terms_of_service: true,
        first_name: 'string',
        last_name: 'string',
        confirmed_at: new Date(),
        invitation_token: null,
        status: 'ACTIVE',
      };
      mockAdminUserModel.findOne.mockResolvedValue(mockAdminUserDto);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(true);
      mockAdminUserModel.save.mockResolvedValue(user);
      await service.acceptInvitation(mockToken, mockAdminUserDto);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        where: { invitation_token: mockToken },
      });
      expect(mockAdminUserModel.save).toHaveBeenCalledWith(user);
    });
  });

  describe('Invite', () => {
    const mockId = 'sdnkajsdnv';
    const mockInvitationAdminDto = {
      first_name: 'mohamed',
      last_name: 'shabin',
      email: 'shabin@gmail.com',
      role: 'ADMIN',
    };

    it('should BadRequestException if not user', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(1);
      await expect(
        service.invite(mockInvitationAdminDto, mockId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should invite the admin user ', async () => {
      const mockAdmin = {
        first_name: mockInvitationAdminDto.first_name,
        last_name: mockInvitationAdminDto.last_name,
        email: mockInvitationAdminDto.email,
        invitation_token: 'mock-token',
        invitation_token_sent_at: new Date(),
        created_by: 'sdnkajsdnv',
        created_by_type: 'ADMIN',
        role: { name: mockInvitationAdminDto.role },
        status: 'PENDING',
      };
      const mockMail = {
        first_name: mockAdmin.first_name,
        last_name: mockAdmin.last_name,
        email: mockAdmin.email,
        token: mockAdmin.invitation_token,
      };
      mockAdminUserModel.findOne.mockResolvedValue(null);
      mockAdminUserModel.save.mockResolvedValue(mockAdmin);
      mockMailService.send(undefined);
      await service.invite(mockInvitationAdminDto, mockId);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        where: { email: mockInvitationAdminDto.email },
      });
      expect(utils.tokenGenerator).toHaveBeenCalledWith();
      expect(mockAdminUserModel.save).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: mockInvitationAdminDto.first_name,
          last_name: mockInvitationAdminDto.last_name,
          email: mockInvitationAdminDto.email,
          invitation_token: 'mock-token',
          created_by: 'sdnkajsdnv',
          created_by_type: 'ADMIN',
          role: { name: 'ADMIN' },
          status: 'PENDING',
        }),
      );
      expect(mockMailService.send).toHaveBeenCalledWith(mockMail);
    });
  });

  describe('Change Password', () => {
    const mockId = 'njdsbkjcbsd';
    const mockChangeAdminPasswordDto = {
      oldPassword: 'password@123',
      password: 'password@111',
      passwordConfirmation: 'password@111',
    };
    it('should bad request Exception if user not found', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(0);
      await expect(
        service.changePassword(mockId, mockChangeAdminPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
    it('should bad request Exception if PASSWORD AND PASSWORDCONFIRMATION DOES NOT MATCH ', async () => {
      const mockChangeAdminPasswordDto = {
        oldPassword: 'password@123',
        password: 'password@111',
        passwordConfirmation: 'passwo@111',
      };
      mockAdminUserModel.findOne.mockResolvedValue(1);
      await expect(
        service.changePassword(mockId, mockChangeAdminPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
    it('should bad request Exception if old password are not equal', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(mockChangeAdminPasswordDto);
      (comparePassword as jest.Mock).mockResolvedValue(false);
      await expect(
        service.changePassword(mockId, mockChangeAdminPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
    it('should bad request Exception if password and oldPassword are equal', async () => {
      const mockChangeAdminPasswordDto = {
        id: 'njdsbkjcbsd',
        oldPassword: 'Password@111',
        password: 'Password@111',
        passwordConfirmation: 'Password@111',
      };
      mockAdminUserModel.findOne.mockResolvedValue(mockChangeAdminPasswordDto);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      await expect(
        service.changePassword(mockId, mockChangeAdminPasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should change', async () => {
      const mockChangeAdminPasswordDto = {
        id: 'njdsbkjcbsd',
        oldPassword: 'Password@1234',
        password: 'Password@111',
        passwordConfirmation: 'Password@111',
      };
      mockAdminUserModel.findOne.mockResolvedValue(mockChangeAdminPasswordDto);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(true);
      mockAdminUserModel.update.mockResolvedValue(mockChangeAdminPasswordDto);
      await service.changePassword(mockId, mockChangeAdminPasswordDto);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        where: { id: mockChangeAdminPasswordDto.id },
        select: ['password'],
      });
      expect(mockAdminUserModel.update).toHaveBeenCalledWith(
        { id: mockChangeAdminPasswordDto.id },
        mockChangeAdminPasswordDto,
      );
    });
  });
  describe('Update Admin', () => {
    it('should bad Request exception if not update  ', async () => {
      mockAdminUserModel.update.mockResolvedValue(null);
      await expect(service.updateAdmin).rejects.toThrow(BadRequestException);
    });
    it('should updating the Admin user ', async () => {
      const mockId = 'sajdbknbas';
      const mockUpdateAdminUserDto = {
        first_name: 'mohamed',
        last_name: 'shabin',
      };
      mockAdminUserModel.update.mockResolvedValue(1);
      mockAdminUserModel.findOne.mockResolvedValue(mockId);
      await service.updateAdmin(mockId, mockUpdateAdminUserDto);
      mockAdminUserModel.update.mockResolvedValue({ mockId });
      mockAdminUserModel.findOne.mockResolvedValue({ where: { id: mockId } });
    });
  });

  describe('update Admin Member', () => {
    const mockId = 'sdjbjbac';
    const mockUpdateAdminUserDto = {
      first_name: 'mohamed',
      last_name: 'shabin',
    };
    it('should Bad Request Exception if user not found', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(0);
      await expect(
        service.updateAdminMember(mockId, mockUpdateAdminUserDto),
      ).rejects.toThrow(BadRequestException);
    });
    it('should Bad Request Exception if user not found', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(mockId);
      mockAdminUserModel.update.mockResolvedValue(1);
      await service.updateAdminMember(mockId, mockUpdateAdminUserDto);
      mockAdminUserModel.findOne.mockResolvedValue({
        where: { id: mockId },
        relations: ['role'],
      });
      mockAdminUserModel.update.mockResolvedValue({
        id: mockId,
      });
    });
  });
  describe('Block Admin', () => {
    const mockId = 'sjdcsdsdwe';
    const mockReason = {
      blocked_reason: 'cheater',
    };
    it('should Bad Request Exception if admin not found', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(null);
      await expect(service.blockAdmin(mockId, mockReason)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should Bad Request Exception if admin are Blocked', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(mockId);
      await expect(service.blockAdmin(mockId, mockReason)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should Bad Request Exception if admin are status are equal Blocked', async () => {
      const mockUser = { id: 'sjdcsdsdwe', status: 'BLOCKED' };
      mockAdminUserModel.findOne.mockResolvedValue(mockUser);
      await expect(service.blockAdmin(mockId, mockReason)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should block the admin', async () => {
      const mockUser = { id: 'sjdcsdsdwe', status: 'ACTIVE' };
      const user = {
        id: 'sjdcsdsdwe',
        block_reason: 'cheater',
        blocked_on: new Date(),
        status: 'BLOCKED',
      };

      mockAdminUserModel.findOne.mockResolvedValue(mockUser);
      mockAdminUserModel.save.mockResolvedValue(user);
      await service.blockAdmin(mockId, mockReason);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        where: { id: mockId },
      });
      expect(mockAdminUserModel.save).toHaveBeenCalledWith(user);
    });
  });

  describe('Un Block Admin', () => {
    const mockId = 'asdflkjhg';
    it('should Bad Request Exception if admin not found', async () => {
      mockAdminUserModel.findOne.mockResolvedValue(null);
      await expect(service.unBlockAdmin(mockId)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should Bad Request Exception if admin is active', async () => {
      const mockUser = { id: 'asdflkjhg', status: 'ACTIVE' };
      mockAdminUserModel.findOne.mockResolvedValue(mockUser);
      await expect(service.unBlockAdmin(mockId)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should un block if admin is active', async () => {
      const mockUser = { id: 'asdflkjhg', status: 'BLOCKED' };
      const user = {
        id: 'asdflkjhg',
        status: 'ACTIVE',
        block_reason: null,
        blocked_on: null,
      };
      mockAdminUserModel.findOne.mockResolvedValue(mockUser);
      mockAdminUserModel.save.mockResolvedValue(user);
      await service.unBlockAdmin(mockId);
      expect(mockAdminUserModel.findOne).toHaveBeenCalledWith({
        where: { id: mockId },
      });
      expect(mockAdminUserModel.save).toHaveBeenCalledWith(user);
    });
  });

  describe('Find All Admins', () => {
    it('should ', async () => {
      const param = { id: 'skjdaf' };
      mockAdminUserModel.findAndCount.mockResolvedValue(null);
      await expect(service.findAllAdmins(param)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should return all admins with pagination and sorting', async () => {
      const mockAdmins = [
        {
          id: '1',
          email: 'admin1@example.com',
          first_name: 'Admin',
          last_name: 'One',
          role: {},
        },
        {
          id: '2',
          email: 'admin2@example.com',
          first_name: 'Admin',
          last_name: 'Two',
          role: {},
        },
      ];
      const params = {
        limit: 10,
        skip: 0,
        sort: { email: 'ASC' },
        page: 1,
        filter: {},
      };
      mockAdminUserModel.findAndCount.mockResolvedValue([mockAdmins, 2]);
      const result = await service.findAllAdmins(params);
      expect(adminUserModel.findAndCount).toHaveBeenCalledWith({
        take: params.limit,
        skip: params.skip,
        order: params.sort,
        relations: ['role'],
        where: params.filter,
      });
      expect(result).toEqual({
        success: true,
        users: mockAdmins,
        meta: {
          currentCount: mockAdmins.length,
          currentPage: params.page,
          currentLimit: params.limit,
          totalCount: 2,
        },
      });
    });
    it('should return all admins with search filter', async () => {
      const mockAdmins = [
        {
          id: '1',
          email: 'admin1@example.com',
          first_name: 'Admin',
          last_name: 'One',
          role: {},
        },
      ];
      const params = {
        limit: 10,
        skip: 0,
        sort: { email: 'ASC' },
        page: 1,
        filter: { search: 'admin1' },
      };
      mockAdminUserModel.findAndCount.mockResolvedValue([mockAdmins, 1]);
      const result = await service.findAllAdmins(params);
      expect(adminUserModel.findAndCount).toHaveBeenCalledWith({
        take: params.limit,
        skip: params.skip,
        order: params.sort,
        relations: ['role'],
        where: [
          { email: ILike(`${params.filter.search}%`) },
          { first_name: ILike(`${params.filter.search}%`) },
          { last_name: ILike(`${params.filter.search}%`) },
        ],
      });
      expect(result).toEqual({
        success: true,
        users: mockAdmins,
        meta: {
          currentCount: mockAdmins.length,
          currentPage: params.page,
          currentLimit: params.limit,
          totalCount: 1,
        },
      });
    });
  });
});
