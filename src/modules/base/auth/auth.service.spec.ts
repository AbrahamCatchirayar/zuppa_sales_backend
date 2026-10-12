import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { comparePassword } from '../../../utils';
import { AdminAccountService } from '../admin-accounts/admin-account.service';
import { AdminAuthService } from './auth.service';
import { AdminUserService } from '../admin-users/admin-user.service';
import { AdminSignIn } from './auth.dto';

jest.mock('../../../utils', () => ({
  comparePassword: jest.fn(),
}));

describe('UserService', () => {
  let service: AdminAuthService;
  let adminUserService: AdminUserService;
  let jwtService: JwtService;
  let adminAccountService: AdminAccountService;

  let mockAdminUserService = {
    findOne: jest.fn(),
    updateUser: jest.fn(),
    forgetPassword: jest.fn(),
    resetPassword: jest.fn(),
    acceptInvitation: jest.fn(),
  };
  let mockAdminAccountUser = {
    findOne: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        { provide: AdminUserService, useValue: mockAdminUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AdminAccountService, useValue: mockAdminAccountUser },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
    jwtService = module.get<JwtService>(JwtService);
    adminAccountService = module.get<AdminAccountService>(AdminAccountService);
    adminUserService = module.get<AdminUserService>(AdminUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findone', () => {
    it('should return account details by id', async () => {
      const body = {
        id: 'bc84bf1540116a4f25d9d7c3c901b340281e2a5e',
      };
      const mockdata = {} as any;
      mockAdminUserService.findOne.mockReturnValue(mockdata);
      await service.findOne(body.id);
      expect(mockAdminUserService.findOne);
    });
  });

  describe('findoneAccount', () => {
    it('should return account details', async () => {
      const body = {
        email: 'sudan@coducer.com',
        password: 'password123',
      };
      const mockdata = {} as any;
      mockAdminAccountUser.findOne.mockReturnValue(mockdata);
      await service.findOneAccount(body);
      expect(mockAdminAccountUser.findOne);
    });
  });

  describe('forgetpassword', () => {
    it('should call adminUserService.forgetPassword and return the result', async () => {
      const mockemail = 'sudan@coducer.com';
      mockAdminUserService.forgetPassword.mockReturnValue(mockemail);
      await service.forgetPassword(mockemail);
      expect(mockAdminUserService.forgetPassword).toHaveBeenCalledWith(
        mockemail,
      );
    });
  });

  describe('resetPassword', () => {
    it('should call adminUserService.resetPassword with the correct parameters', async () => {
      const mockdata = {
        token: 'bc84bf1540116a4f25d9d7c3c901b340281e2a5e',
        password: 'Sudan@123',
        password_confirmation: 'Sudan@123',
      };
      mockAdminUserService.resetPassword.mockReturnValue(mockdata);
      await service.resetPassword(mockdata);
      expect(mockAdminUserService.resetPassword).toHaveBeenCalledWith(mockdata);
    });
  });

  describe('acceptInvitation', () => {
    it('should call adminUserService.acceptInvitation with the correct parameters', async () => {
      const token = 'bc84bf1540116a4f25d9d7c3c901b340281e2a5e';
      const mockdata = {
        password: 'String@123',
        confirm_password: 'String@123',
        phone_number: '+919876543210',
        accept_terms_and_conditions: true,
        first_name: 'sudan',
        last_name: 'md',
      };
      mockAdminUserService.acceptInvitation.mockReturnValue(mockdata);
      await service.acceptInvitation(token, mockdata);
      expect(mockAdminUserService.acceptInvitation).toHaveBeenCalledWith(
        token,
        mockdata,
      );
    });
  });

  describe('adminSignIn', () => {
    const mockBody = {
      email: 'test@example.com',
      password: 'password',
    };
    it('should throw an error if the user is not found', async () => {
      mockAdminUserService.findOne.mockResolvedValue(null);

      await expect(service.adminSignIn(mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the password is not set', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        password: null,
        status: 'ACTIVE',
        confirmed_at: new Date(),
      };
      mockAdminUserService.findOne.mockResolvedValue(user);

      await expect(service.adminSignIn(mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the password does not match', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        password: 'hashed-password',
        status: 'ACTIVE',
        confirmed_at: new Date(),
      };
      mockAdminUserService.findOne.mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.adminSignIn(mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the user is blocked', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        password: 'hashed-password',
        status: 'BLOCKED',
        confirmed_at: new Date(),
      };
      mockAdminUserService.findOne.mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      await expect(service.adminSignIn(mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the user is not confirmed', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        password: 'hashed-password',
        status: 'ACTIVE',
        confirmed_at: null,
      };
      mockAdminUserService.findOne.mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      await expect(service.adminSignIn(mockBody)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return a token if the sign-in is successful', async () => {
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        password: 'hashed-password',
        status: 'ACTIVE',
        confirmed_at: new Date(),
      };
      mockAdminUserService.findOne.mockResolvedValue(user);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.adminSignIn(mockBody);
      expect(result).toEqual({ success: true, token: 'token' });
    });
  });
});
