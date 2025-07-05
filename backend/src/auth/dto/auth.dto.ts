import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNumberString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { $Enums } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email đăng ký' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Mật khẩu' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được quá 50 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
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
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
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
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được quá 50 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
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
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được quá 50 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
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
