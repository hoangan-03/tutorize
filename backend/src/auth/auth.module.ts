import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        // Validate JWT_SECRET exists and has minimum length
        if (!jwtSecret) {
          throw new Error(
            'JWT_SECRET is not defined in environment variables. Please set it in your .env file.',
          );
        }

        if (jwtSecret.length < 32) {
          throw new Error(
            'JWT_SECRET must be at least 32 characters long for security reasons.',
          );
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>(
              'JWT_ACCESS_EXPIRES_IN',
              '15m',
            ),
          },
        };
      },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, TokenBlacklistService],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
    RolesGuard,
    TokenBlacklistService,
  ],
})
export class AuthModule {}
