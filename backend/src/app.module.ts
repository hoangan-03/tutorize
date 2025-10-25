import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UserModule } from './user/user.module';
import { QuizModule } from './quiz/quiz.module';
import { ExerciseModule } from './exercise/exercise.module';
import { DocumentModule } from './document/document.module';
import { IeltsReadingModule } from './ielts-reading/ielts-reading.module';
import { UploadModule } from './upload/upload.module';
import { IeltsWritingModule } from './ielts-writing/ielts-writing.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

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
    PrismaModule,
    AuthModule,
    UserModule,
    QuizModule,
    ExerciseModule,
    DocumentModule,
    IeltsReadingModule,
    IeltsWritingModule,
    UploadModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global authentication guard
    // Tất cả routes đều require authentication trừ khi có @Public() decorator
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global authorization guard
    // Kiểm tra roles với @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
