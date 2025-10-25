import { SetMetadata } from '@nestjs/common';
import { $Enums } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator để chỉ định roles được phép truy cập endpoint
 *
 * Usage:
 * @Roles(Role.TEACHER)
 * @Roles(Role.TEACHER, Role.ADMIN)
 */
export const Roles = (...roles: $Enums.Role[]) => SetMetadata(ROLES_KEY, roles);
