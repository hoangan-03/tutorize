import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNumber,
  Matches,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { $Enums } from '@prisma/client';

@ValidatorConstraint({ name: 'passwordStrength', async: false })
export class PasswordStrengthValidator implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password) return false;

    // Kiểm tra từng yêu cầu
    const hasMinLength = password.length >= 8;
    const hasMaxLength = password.length <= 50;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasValidChars = /^[a-zA-Z\d@$!%*?&]+$/.test(password);

    return (
      hasMinLength &&
      hasMaxLength &&
      hasLowercase &&
      hasUppercase &&
      hasNumber &&
      hasValidChars
    );
  }

  defaultMessage(args: ValidationArguments) {
    const password = args.value as string;
    if (!password) return 'Mật khẩu không được để trống';

    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('ít nhất 8 ký tự');
    }
    if (password.length > 50) {
      errors.push('không quá 50 ký tự');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('ít nhất 1 chữ thường (a-z)');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('ít nhất 1 chữ hoa (A-Z)');
    }
    if (!/\d/.test(password)) {
      errors.push('ít nhất 1 số (0-9)');
    }
    if (!/^[a-zA-Z\d@$!%*?&]+$/.test(password)) {
      errors.push('chỉ chứa chữ cái, số và ký tự đặc biệt (@$!%*?&)');
    }

    if (errors.length > 0) {
      return `Mật khẩu phải có: ${errors.join(', ')}`;
    }

    return 'Mật khẩu không hợp lệ';
  }
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email đăng ký' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Mật khẩu' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Validate(PasswordStrengthValidator)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ và tên' })
  @IsString()
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên không được quá 100 ký tự' })
  name: string;

  @ApiProperty({ enum: $Enums.Role, description: 'Vai trò người dùng' })
  @IsEnum($Enums.Role, { message: 'Vai trò không hợp lệ' })
  role: $Enums.Role;

  @ApiPropertyOptional({
    example: 10,
    description: 'Khối lớp (dành cho học sinh)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  @IsNumber({}, { message: 'Khối lớp phải là số' })
  grade?: number;

  @ApiPropertyOptional({
    example: $Enums.Subject.MATH,
    description: 'Môn học (dành cho giáo viên)',
  })
  @IsOptional()
  @IsString()
  subject?: $Enums.Subject;
}

export class LoginDto {
  @ApiProperty({
    example: 'teacher@tutorplatform.com',
    description: 'Email đăng nhập',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Teacher123!', description: 'Mật khẩu' })
  @IsString()
  @MinLength(1, { message: 'Mật khẩu không được để trống' })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu hiện tại' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'Mật khẩu mới' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Validate(PasswordStrengthValidator)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email cần reset mật khẩu',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token reset mật khẩu' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Mật khẩu mới' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @Validate(PasswordStrengthValidator)
  password: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Họ', example: 'Nguyễn' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Tên', example: 'Văn A' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0909090909' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ',
    example: '123 Đường ABC, TP.HCM',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Trường học', example: 'Trường ABC' })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh theo format DD-MM-YYYY',
    example: '01-01-2000',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'Ngày sinh phải có định dạng DD-MM-YYYY (ví dụ: 01-01-2000)',
  })
  dateOfBirth?: string;
}
