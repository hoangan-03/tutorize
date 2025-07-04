import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import {
  ExerciseController,
  ExerciseSubmissionController,
} from './exercise.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExerciseController, ExerciseSubmissionController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
