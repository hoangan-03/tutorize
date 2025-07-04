import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController, QuizSubmissionController } from './quiz.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController, QuizSubmissionController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
