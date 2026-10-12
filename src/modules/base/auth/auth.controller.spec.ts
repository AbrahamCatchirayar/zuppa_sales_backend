import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthController } from './auth.controller';
import { AdminAuthService } from './auth.service';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;
  let service: AdminAuthService;

  const mockAdminAuthService = {
    adminSignIn: jest.fn(),
    forgetPassword: jest.fn(),
    resetPassword: jest.fn(),
    acceptInvitation: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [
        {
          provide: AdminAuthService,
          useValue: mockAdminAuthService,
        },
      ],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
    service = module.get<AdminAuthService>(AdminAuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('admin', () => {
    describe('adminSignIn', () => {
      it('should sign in ', async () => {
        const mockSignUp = {
          email: 'shabin@coducer.com',
          password: 'Password@123',
        };
        await controller.adminSignIn(mockSignUp);
        expect(service.adminSignIn).toHaveBeenCalledWith(mockSignUp);
      });
    });

    describe('Forget Password', () => {
      it('should forget Password', async () => {
        const mockEmailDto = { email: 'sudan@coducer.com' };
        await controller.forgetPassword(mockEmailDto);
        expect(service.forgetPassword).toHaveBeenCalledWith(mockEmailDto.email);
      });
    });

    describe('Accept Invitation', () => {
      it('should Accept the Invitation', async () => {
        const mockToken = 'xhsbjdbcjsad';
        const password = {
          password: 'string',
          confirm_password: 'string',
          phone_number: 'string',
          accept_terms_and_conditions: true,
          first_name: 'string',
          last_name: 'string',
        };
        await controller.acceptInvitation(mockToken, password);
        expect(service.acceptInvitation).toHaveBeenCalledWith(
          mockToken,
          password,
        );
      });
    });

    describe('reset Password', () => {
      it('should reset Password ', async () => {
        const ResetPasswordDto = {
          token: 'string',
          password: 'Password@123',
          password_confirmation: 'Password@123',
        };
        // await controller.resetPassword(ResetPasswordDto);
        expect(service.resetPassword).toHaveBeenCalledWith(ResetPasswordDto);
      });
    });

    describe('me', () => {
      it('should return the me ', async () => {
        const user = {} as any;
        const result = await controller.getUser(user);
        expect(result).toEqual({ success: true, user });
      });
    });
  });
});
