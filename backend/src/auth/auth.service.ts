/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { $Enums } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role, grade, subject } =
      registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            firstName,
            lastName,
            grade: role === $Enums.Role.STUDENT ? grade : null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const tokens = await this.generateTokens(user);

    this.emailService
      .sendWelcomeEmail(user.email, user.profile?.firstName)
      .catch((error) => {
        console.error('Failed to send welcome email:', error);
      });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    this.emailService
      .sendPasswordChangeNotification(user.email, user.profile?.firstName)
      .catch((error) => {
        console.error('Failed to send password change notification:', error);
      });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message:
          'Nếu email tồn tại, mật khẩu tạm thời đã được gửi đến email của bạn',
        success: true,
      };
    }

    if (!user.isActive) {
      return {
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ với quản trị viên.',
        success: false,
      };
    }

    const oldPassword = user.password;

    const tempPassword = this.generateRandomPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedTempPassword,
        updatedAt: new Date(),
      },
    });

    try {
      await this.emailService.sendTemporaryPassword(email, tempPassword);

      return {
        message: 'Mật khẩu tạm thời đã được gửi đến email của bạn',
        success: true,
      };
    } catch (error) {
      console.error('Failed to send email, reverting password change:', error);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: oldPassword },
      });

      return {
        message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
        success: false,
      };
    }
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const { password: _, ...userWithoutPassword } = user;

    if (userWithoutPassword.profile?.dateOfBirth) {
      (userWithoutPassword.profile as any).dateOfBirth =
        userWithoutPassword.profile.dateOfBirth.toISOString().split('T')[0];
    }

    return userWithoutPassword;
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    let parsedDateOfBirth: Date | undefined;
    if (updateProfileDto.dateOfBirth) {
      const [day, month, year] = updateProfileDto.dateOfBirth
        .split('-')
        .map(Number);
      parsedDateOfBirth = new Date(Date.UTC(year, month - 1, day));
    }

    const updatedProfile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
        address: updateProfileDto.address,
        school: updateProfileDto.school,
        dateOfBirth: parsedDateOfBirth,
      },
      create: {
        userId,
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
        address: updateProfileDto.address,
        school: updateProfileDto.school,
        dateOfBirth: parsedDateOfBirth,
      },
    });

    const formattedProfile = {
      ...updatedProfile,
      dateOfBirth: updatedProfile.dateOfBirth
        ? updatedProfile.dateOfBirth
            .toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
            .split('/')
            .join('-')
        : null,
    };

    return {
      message: 'Cập nhật thông tin thành công',
      profile: formattedProfile,
    };
  }

  /**
   * Generate access and refresh tokens for user
   * Access token: short-lived (15 minutes)
   * Refresh token: long-lived (7 days)
   */
  private async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    };
  }

  /**
   * Logout user by blacklisting their token
   * @param token JWT token to blacklist
   */
  async logout(token: string): Promise<{ message: string }> {
    try {
      // Verify token trước khi blacklist
      const decoded = this.jwtService.decode(token) as JwtPayload;

      if (!decoded || !decoded.exp) {
        throw new BadRequestException('Token không hợp lệ');
      }

      // Tính thời gian còn lại của token
      const expiresIn = decoded.exp * 1000 - Date.now();

      if (expiresIn > 0) {
        // Chỉ blacklist token nếu còn hạn
        this.tokenBlacklistService.addToBlacklist(token, expiresIn);
      }

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      // Ngay cả khi có lỗi, vẫn return success để không leak thông tin
      return { message: 'Đăng xuất thành công' };
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Check if it's a refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      // Check if token is blacklisted
      if (this.tokenBlacklistService.isBlacklisted(refreshToken)) {
        throw new UnauthorizedException(
          'Token đã bị thu hồi - vui lòng đăng nhập lại',
        );
      }

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException(
          'Người dùng không tồn tại hoặc đã bị khóa',
        );
      }

      // Generate new access token
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ),
      });

      return {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ),
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  private generateRandomPassword(): string {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '@$!%*?&';

    let password = '';
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(
      Math.floor(Math.random() * specialChars.length),
    );

    const allChars = upperCase + lowerCase + numbers + specialChars;
    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
