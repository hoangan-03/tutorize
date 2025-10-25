import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { $Enums } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    role: $Enums.Role.STUDENT,
    isActive: true,
    profile: {
      firstName: 'Test',
      lastName: 'User',
      userId: 1,
      grade: 10,
      phone: null,
      address: null,
      school: null,
      dateOfBirth: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  const mockRequest = {
    headers: {
      authorization: 'Bearer valid-token',
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              return null;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            isBlacklisted: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
    tokenBlacklistService = module.get<TokenBlacklistService>(
      TokenBlacklistService,
    );
  });

  describe('validate', () => {
    it('should successfully validate token and return user', async () => {
      const payload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await strategy.validate(mockRequest, payload);

      expect(result).toEqual({
        sub: mockUser.id,
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        profile: mockUser.profile,
      });
    });

    it('should throw UnauthorizedException for invalid payload sub', async () => {
      const payload: JwtPayload = {
        sub: 'invalid' as any, // Should be number
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
      };

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is blacklisted', async () => {
      const payload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
      };

      jest.spyOn(tokenBlacklistService, 'isBlacklisted').mockReturnValue(true);

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(
        'Token đã bị thu hồi',
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const payload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
      };
      const inactiveUser = { ...mockUser, isActive: false };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(inactiveUser);

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const payload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
      };
      const requestWithoutAuth = {
        headers: {},
      } as any;

      await expect(
        strategy.validate(requestWithoutAuth, payload),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not update lastLoginAt (performance optimization)', async () => {
      const payload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        role: $Enums.Role.STUDENT,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await strategy.validate(mockRequest, payload);

      // Should NOT call update - this was the performance issue we fixed
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
