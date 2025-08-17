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
    private emailService: EmailService,
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

    // Send welcome email (don't wait for it)
    this.emailService
      .sendWelcomeEmail(user.email, user.profile?.firstName || 'bạn')
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
      include: { profile: true },
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
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    // Send password change notification (don't wait for it)
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
      include: { profile: true },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
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

    // Generate a secure random temporary password
    const tempPassword = this.generateRandomPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

    // Update user password to temporary password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedTempPassword,
        updatedAt: new Date(),
      },
    });

    try {
      // Send temporary password via email
      await this.emailService.sendTemporaryPassword(email, tempPassword);

      return {
        message: 'Mật khẩu tạm thời đã được gửi đến email của bạn',
        success: true,
      };
    } catch (error) {
      // If email fails, revert the password change
      console.error('Failed to send email, reverting password change:', error);

      // You might want to revert the password change here if email fails
      // For now, we'll keep the temp password and log the error

      return {
        message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
        success: false,
      };
    }
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

    // Parse dateOfBirth from DD-MM-YYYY string to Date
    let parsedDateOfBirth: Date | undefined;
    if (updateProfileDto.dateOfBirth) {
      const [day, month, year] = updateProfileDto.dateOfBirth
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

  private generateRandomPassword(): string {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '@$!%*?&';

    // Ensure at least one character from each category
    let password = '';
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(
      Math.floor(Math.random() * specialChars.length),
    );

    // Fill the rest with random characters from all categories
    const allChars = upperCase + lowerCase + numbers + specialChars;
    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to randomize the order
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
