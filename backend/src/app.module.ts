import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuizModule } from './quiz/quiz.module';
import { ExerciseModule } from './exercise/exercise.module';
import { DocumentModule } from './document/document.module';
import { IeltsReadingModule } from './ielts-reading/ielts-reading.module';
import { UploadModule } from './upload/upload.module';
import { IeltsWritingModule } from './ielts-writing/ielts-writing.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
