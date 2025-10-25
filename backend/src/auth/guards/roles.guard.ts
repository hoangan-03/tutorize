import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { $Enums } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Global authorization guard
 * Kiểm tra xem user có role phù hợp để truy cập endpoint không
 *
 * Sử dụng với @Roles decorator
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<$Enums.Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu không có @Roles decorator, cho phép tất cả
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Nếu chưa authenticated (không có user), throw ForbiddenException
    if (!user) {
      throw new ForbiddenException(
        'Bạn cần đăng nhập để truy cập tài nguyên này',
      );
    }

    // Check if user has required role
    const hasRole = requiredRoles.some((role) => user?.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    return true;
  }
}
