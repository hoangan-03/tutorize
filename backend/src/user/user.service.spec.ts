import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: $Enums.Role.STUDENT,
        grade: 10,
      };

      const mockUser = {
        id: 1,
        email: createUserDto.email,
        password: 'hashedpassword',
        role: $Enums.Role.STUDENT,
        isActive: true,
        profile: {
          firstName: 'Test',
          lastName: 'User',
          grade: 10,
        },
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedpassword' as never));

      const result = await service.create(createUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(createUserDto.email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: $Enums.Role.STUDENT,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 1 } as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already in use',
      );
    });
  });

  describe('findOne', () => {
    it('should return user without password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        profile: { firstName: 'Test', lastName: 'User' },
        _count: {
          quizzesCreated: 0,
          quizSubmissions: 0,
          exercisesCreated: 0,
          exerciseSubmissions: 0,
          documentsUploaded: 0,
        },
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const mockUser = { id: 1, role: $Enums.Role.TEACHER };
      const updatedUser = {
        id: 1,
        email: 'updated@example.com',
        password: 'hashedpassword',
        profile: { firstName: 'Updated', lastName: 'User' },
      };

      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce({ id: 1, role: $Enums.Role.TEACHER } as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);

      const result = await service.update(1, { firstName: 'Updated' }, 1);

      expect(result).not.toHaveProperty('password');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user lacks permission', async () => {
      const mockUser = { id: 1, role: $Enums.Role.STUDENT };
      const currentUser = { id: 2, role: $Enums.Role.STUDENT };

      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValueOnce(mockUser as any)
        .mockResolvedValueOnce(currentUser as any);

      await expect(service.update(1, {}, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('toggleActivation', () => {
    it('should toggle user activation status', async () => {
      const mockUser = { id: 1, isActive: true };
      const updatedUser = { id: 1, isActive: false };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);

      const result = await service.toggleActivation(1);

      expect(result.isActive).toBe(false);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.toggleActivation(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      jest
        .spyOn(prisma.user, 'count')
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(90) // active
        .mockResolvedValueOnce(80) // students
        .mockResolvedValueOnce(20); // teachers
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      const stats = await service.getStats();

      expect(stats.totalUsers).toBe(100);
      expect(stats.activeUsers).toBe(90);
      expect(stats.inactiveUsers).toBe(10);
      expect(stats.roleDistribution.students).toBe(80);
      expect(stats.roleDistribution.teachers).toBe(20);
    });
  });
});
