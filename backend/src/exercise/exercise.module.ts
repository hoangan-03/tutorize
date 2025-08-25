import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import {
  ExerciseController,
  ExerciseSubmissionController,
} from './exercise.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../file/file.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ExerciseController, ExerciseSubmissionController],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
