import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { jwtCookieExtractor } from './jwt-cookie-extractor';
import { $Enums } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  role: $Enums.Role;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: jwtCookieExtractor, // Custom extractor: Authorization header OR cookie
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, // Để có thể access request object
    });
  }

  async validate(request: Request, payload: JwtPayload) {
    // Validate payload structure
    if (typeof payload.sub !== 'number' || !Number.isInteger(payload.sub)) {
      throw new UnauthorizedException(
        'Token không hợp lệ - vui lòng đăng nhập lại',
      );
    }

    // Extract token from request header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token không tồn tại');
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted
    if (this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException(
        'Token đã bị thu hồi - vui lòng đăng nhập lại',
      );
    }

    // Validate user exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        profile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Token không hợp lệ hoặc tài khoản đã bị khóa',
      );
    }

    // REMOVED: Update lastLoginAt (was causing performance issues)
    // lastLoginAt is now only updated during actual login

    return {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };
  }
}
