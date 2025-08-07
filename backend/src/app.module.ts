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
import { WritingModule } from './writing/writing.module';
import { IeltsModule } from './ielts/ielts.module';
import { UploadModule } from './upload/upload.module';

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
    WritingModule,
    IeltsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
