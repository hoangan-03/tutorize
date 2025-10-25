import { Request } from 'express';

/**
 * Custom JWT extractor để lấy token từ:
 * 1. Authorization header (Bearer token) - ưu tiên
 * 2. httpOnly cookie (access_token) - fallback
 *
 * Điều này cho phép backward compatibility khi migrate từ localStorage sang cookies
 */
export const jwtCookieExtractor = (request: Request): string | null => {
  let token: string | null = null;

  // 1. Thử lấy từ Authorization header (Bearer token)
  if (request.headers.authorization) {
    const authHeader = request.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // 2. Fallback: Lấy từ cookie
  if (!token && request.cookies && request.cookies.access_token) {
    token = request.cookies.access_token;
  }

  return token;
};
