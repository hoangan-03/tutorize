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
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
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
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, grade, subject } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        grade: role === $Enums.Role.STUDENT ? grade : null,
        subject:
          role === $Enums.Role.TEACHER ? (subject as $Enums.Subject) : null,
        profile: {
          create: {
            preferences: {
              language: 'vi',
              theme: 'light',
              notifications: true,
              emailNotifications: true,
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Generate JWT token
    const tokens = await this.generateTokens(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Remove password from response
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
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'Nếu email tồn tại, link reset mật khẩu đã được gửi' };
    }

    // Generate reset token (in real app, store this in database with expiration)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '1h' },
    );

    // TODO: Send email with reset link
    // For now, just return the token (remove this in production)
    return {
      message: 'Link reset mật khẩu đã được gửi đến email của bạn',
      resetToken, // Remove this in production
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    try {
      // Verify reset token
      const payload = this.jwtService.verify(token) as any;

      if (payload.type !== 'reset') {
        throw new BadRequestException('Token không hợp lệ');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update password
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword },
      });

      return { message: 'Reset mật khẩu thành công' };
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
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

    // Format dateOfBirth in profile if it exists
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

    // Parse dateOfBirth from YYYY-MM-DD string to Date
    let parsedDateOfBirth: Date | undefined;
    if (updateProfileDto.dateOfBirth) {
      const [year, month, day] = updateProfileDto.dateOfBirth
        .split('-')
        .map(Number);
      parsedDateOfBirth = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed
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

    // Format dateOfBirth for response
    const formattedProfile = {
      ...updatedProfile,
      dateOfBirth: updatedProfile.dateOfBirth
        ? updatedProfile.dateOfBirth.toISOString().split('T')[0]
        : null,
    };

    return {
      message: 'Cập nhật thông tin thành công',
      profile: formattedProfile,
    };
  }

  private async generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
    };
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
}
