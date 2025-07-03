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

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UserModule,
    QuizModule,
    ExerciseModule,
    DocumentModule,
    WritingModule,
    IeltsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
