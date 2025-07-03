import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from 'src/enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Roles;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (typeof payload.sub !== 'number' || !Number.isInteger(payload.sub)) {
      throw new UnauthorizedException(
        'Token không hợp lệ - vui lòng đăng nhập lại',
      );
    }

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

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      grade: user.grade,
      subject: user.subject,
      avatar: user.avatar,
      isVerified: user.isVerified,
      profile: user.profile,
    };
  }
}
