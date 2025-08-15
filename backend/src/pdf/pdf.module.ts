import { Module } from '@nestjs/common';
import { ExerciseModule } from '../exercise/exercise.module';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [ExerciseModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
