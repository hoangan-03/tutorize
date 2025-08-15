import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { ExerciseService } from '../exercise/exercise.service';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly exerciseService: ExerciseService) {}

  async generateExercisePdf(
    exerciseId: number,
    userId: number,
    font?: string,
  ): Promise<Buffer> {
    const exercise = await this.exerciseService.findOne(exerciseId, userId);
    const html = this.buildHtml(exercise, font);
    let browser: Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });
      return pdf;
    } catch (e) {
      this.logger.error('PDF generation failed', e as any);
      throw new InternalServerErrorException('Cannot generate PDF');
    } finally {
      if (browser) await browser.close();
    }
  }

  private buildHtml(exercise: any, font?: string): string {
    const baseFont = font || 'Cambria, "Times New Roman", serif';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />
<title>${this.escape(exercise.name || 'Exercise')}</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous" />
<style>
  body { font-family: ${baseFont}; font-size:14px; line-height:1.5; color:#222; }
  h1,h2,h3,h4 { margin:0 0 .6em; }
  .container { max-width: 800px; margin:0 auto; }
  .exercise-title { text-align:center; margin-bottom:20px; }
  .meta { font-size:12px; color:#555; margin-bottom:20px; }
  table { width:100%; border-collapse: collapse; margin: 12px 0; }
  table, th, td { border:1px solid #666; }
  th, td { padding:6px 8px; }
  code { font-family: 'Courier New', monospace; background:#f5f5f5; padding:2px 4px; border-radius:4px; }
  .katex-display { margin: 1em 0; }
  ol, ul { padding-left: 1.3em; }
  hr { margin: 24px 0; }
</style>
</head><body>
<div class="container">
  <div class="exercise-title"><h1>${this.escape(exercise.name || '')}</h1></div>
  <div id="content">${exercise.content || ''}</div>
</div>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous" onload="renderMathInElement(document.getElementById('content'), {delimiters:[{left:'$$', right:'$$', display:true},{left:'\\(', right:'\\)', display:false}], throwOnError:false});"></script>
</body></html>`;
  }

  private escape(input: string): string {
    return input.replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c]!,
    );
  }
}
