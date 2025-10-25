import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCookieInterceptor } from './interceptors/auth-cookie.interceptor';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { $Enums } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
  };

  const mockResponse = {
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(AuthCookieInterceptor)
      .useValue({ intercept: (context, next) => next.handle() })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: $Enums.Role.STUDENT,
        grade: 10,
      };

      const expectedResult = {
        user: {
          id: 1,
          email: 'test@example.com',
          role: $Enums.Role.STUDENT,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: '15m',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      const expectedResult = {
        user: {
          id: 1,
          email: 'test@example.com',
          role: $Enums.Role.STUDENT,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: '15m',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear cookies', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const body = { token: 'valid-token' };

      mockAuthService.logout.mockResolvedValue({
        message: 'Đăng xuất thành công',
      });

      const result = await controller.logout(mockUser, body, mockResponse);

      expect(result).toEqual({ message: 'Đăng xuất thành công' });
      expect(authService.logout).toHaveBeenCalledWith('valid-token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });

    it('should clear cookies even without token', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const body = {};

      const result = await controller.logout(mockUser, body, mockResponse);

      expect(result).toEqual({ message: 'Đăng xuất thành công' });
      expect(authService.logout).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('refresh', () => {
    it('should successfully refresh access token', async () => {
      const body = { refreshToken: 'valid-refresh-token' };
      const expectedResult = {
        accessToken: 'new-access-token',
        tokenType: 'Bearer',
        expiresIn: '15m',
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh(body);

      expect(result).toEqual(expectedResult);
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = 1;
      const expectedProfile = {
        id: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
        profile: {
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockAuthService.getProfile.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(userId);

      expect(result).toEqual(expectedProfile);
      expect(authService.getProfile).toHaveBeenCalledWith(userId);
    });
  });
});
