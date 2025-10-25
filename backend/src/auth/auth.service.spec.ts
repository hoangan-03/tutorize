import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { $Enums } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$12$hashedpassword',
    role: $Enums.Role.STUDENT,
    isActive: true,
    profile: {
      firstName: 'Test',
      lastName: 'User',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
            sendPasswordChangeNotification: jest.fn(),
            sendTemporaryPassword: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            addToBlacklist: jest.fn(),
            isBlacklisted: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(
      TokenBlacklistService,
    );
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'wrong@example.com',
        password: 'password',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully blacklist valid token', async () => {
      const token = 'valid-token';
      const mockDecoded = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes from now
      };

      jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecoded);

      const result = await service.logout(token);

      expect(result).toEqual({ message: 'Đăng xuất thành công' });
      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        token,
        expect.any(Number),
      );
    });

    it('should handle invalid token gracefully', async () => {
      const token = 'invalid-token';

      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      const result = await service.logout(token);

      // Should still return success to not leak information
      expect(result).toEqual({ message: 'Đăng xuất thành công' });
    });

    it('should not blacklist expired token', async () => {
      const token = 'expired-token';
      const mockDecoded = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
        exp: Math.floor(Date.now() / 1000) - 900, // Expired 15 minutes ago
      };

      jest.spyOn(jwtService, 'decode').mockReturnValue(mockDecoded);

      await service.logout(token);

      // Should not call addToBlacklist for expired token
      expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
        type: 'refresh' as const,
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('new-access-token');

      const result = await service.refreshAccessToken(refreshToken);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('tokenType', 'Bearer');
    });

    it('should throw UnauthorizedException for invalid token type', async () => {
      const refreshToken = 'access-token-not-refresh';
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
        type: 'access' as const, // Wrong type!
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for blacklisted token', async () => {
      const refreshToken = 'blacklisted-token';
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
        type: 'refresh' as const,
      };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(tokenBlacklistService, 'isBlacklisted').mockReturnValue(true);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
        type: 'refresh' as const,
      };
      const inactiveUser = { ...mockUser, isActive: false };

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(inactiveUser);

      await expect(service.refreshAccessToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
