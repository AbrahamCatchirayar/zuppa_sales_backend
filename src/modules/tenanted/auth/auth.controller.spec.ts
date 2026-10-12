import { Test, TestingModule } from '@nestjs/testing';
import { UnAuthController, AuthController } from './auth.controller';
import { UnAuthService } from './unauth.service';
import { AuthService } from './auth.service';
import { SignUpDTO, SignInDTO, EmailDTO } from './dto/singup.dto';
import { JwtAuthGuard, JwtAuthRefreshGuard } from '../../../jwt/jwt-gaurd';
import { UserDecorator } from '../../../modules/user.decorator';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

jest.mock('./unauth.service');
jest.mock('./auth.service');

describe('UnAuthController', () => {
  let unauthController: UnAuthController;
  let unauthService: UnAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnAuthController],
      providers: [
        {
          provide: UnAuthService,
          useValue: {
            signUp: jest.fn(),
          },
        },
      ],
    }).compile();

    unauthController = module.get<UnAuthController>(UnAuthController);
    unauthService = module.get<UnAuthService>(UnAuthService);
  });

  describe('POST /auth/signup', () => {
    it('should successfully sign up a user', async () => {
      const signUpDto: SignUpDTO = {
        name: 'Test User',
        account_name: 'Test Company',
        slug: 'test-slug',
        email: 'test@example.com',
        password: 'password@123',
      };

      // Mock successful response from signUp method
      jest.spyOn(unauthService, 'signUp').mockResolvedValue({
        success: true,
        message: 'Account created successfully',
        invitation_token: 'token'
      });

      const result = await unauthController.signUp(signUpDto);
      expect(result).toEqual({
        success: true,
        message: 'Account created successfully',
      });
      expect(unauthService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('should throw an error if account already exists', async () => {
      const signUpDto: SignUpDTO = {
        name: 'Test User',
        account_name: 'Test Company',
        slug: 'test-slug',
        email: 'test@example.com',
        password: 'password@123',
      };

      // Mock error from signUp method
      jest
        .spyOn(unauthService, 'signUp')
        .mockRejectedValue(new BadRequestException('Account already exists'));

      await expect(unauthController.signUp(signUpDto)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            forgotPassword: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('POST /v1/auth/signin', () => {
    it('should sign in successfully and return user data', async () => {
      const signInDto: SignInDTO = {
        email: 'test@example.com',
        password: 'password@123',
      };

      // Mock response with both accessToken and refreshToken
      const mockSignInResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      // Mock successful response from signIn method
      jest.spyOn(authService, 'signIn').mockResolvedValue(mockSignInResponse);

      const result = await authController.signIn(signInDto);
      expect(result.success).toBe(true);
      expect(result.accessToken).toEqual('mock-access-token');
      expect(result.refreshToken).toEqual('mock-refresh-token');
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  // describe('POST /v1/auth/forgot_password', () => {
  //   it('should send reset password link', async () => {
  //     const emailDto: EmailDTO = { email: 'test@example.com' };

  //     // Mock successful response from forgotPassword method
  //     jest.spyOn(authService, 'forgotPassword').mockResolvedValue({
  //       success: true,
  //       message: 'Reset password link sent',
  //     });

  //     const result = await authController.forgotPassword(emailDto);
  //     expect(result).toEqual({
  //       success: true,
  //       message: 'Reset password link sent',
  //     });
  //     expect(authService.forgotPassword).toHaveBeenCalledWith(emailDto);
  //   });
  // });

  describe('GET /v1/auth/me', () => {
    it('should return user data if authorized', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      // Mock user decorator value
      const userDecoratorMock = jest.fn().mockReturnValue(mockUser);

      // Test the me endpoint
      const result = await authController.me(userDecoratorMock());

      expect(result.success).toBe(true); // 'success' is a custom property added to the response
      expect(result.user).toEqual(mockUser); // Ensure the 'user' property is returned correctly
    });
  });

  describe('GET /v1/auth/refresh', () => {
    it('should return new tokens on refresh', async () => {
      const mockUser = { sub: 1, refreshToken: 'mock-refresh-token' };

      // Mock the response of refreshTokens method
      jest.spyOn(authService, 'refreshTokens').mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await authController.refreshToken(mockUser);
      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(authService.refreshTokens).toHaveBeenCalledWith(
        mockUser.sub,
        mockUser.refreshToken,
      );
    });
  });
});
