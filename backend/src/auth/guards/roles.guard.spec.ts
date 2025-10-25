import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { $Enums } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const mockExecutionContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const context = mockExecutionContext({
        id: 1,
        role: $Enums.Role.STUDENT,
      });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      const user = { id: 1, role: $Enums.Role.TEACHER };
      const context = mockExecutionContext(user);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([$Enums.Role.TEACHER]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const user = { id: 1, role: $Enums.Role.STUDENT };
      const context = mockExecutionContext(user);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([$Enums.Role.TEACHER, $Enums.Role.STUDENT]);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      const user = { id: 1, role: $Enums.Role.STUDENT };
      const context = mockExecutionContext(user);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([$Enums.Role.TEACHER]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      const context = mockExecutionContext(undefined); // No user

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([$Enums.Role.TEACHER]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Bạn cần đăng nhập để truy cập tài nguyên này',
      );
    });

    it('should handle null user gracefully', () => {
      const context = mockExecutionContext(null);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([$Enums.Role.TEACHER]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
