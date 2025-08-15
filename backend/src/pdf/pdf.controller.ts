import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('exercise/:id')
  async generateExercise(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
    @Res() res: Response,
  ) {
    const buffer = await this.pdfService.generateExercisePdf(id, userId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=exercise-${id}.pdf`,
    );
    res.send(buffer);
  }
}
