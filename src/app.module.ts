import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuizModule } from './quiz/quiz.module';
import { ExerciseModule } from './exercise/exercise.module';
import { DocumentModule } from './document/document.module';
import { WritingModule } from './writing/writing.module';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute
          },
        ],
      }),
    }),

    // Passport & JWT
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigModule],
    }),

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UserModule,
    QuizModule,
    ExerciseModule,
    DocumentModule,
    WritingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
