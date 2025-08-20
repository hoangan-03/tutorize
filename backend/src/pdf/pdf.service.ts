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
    showHeader = true,
  ): Promise<Buffer> {
    const exercise = await this.exerciseService.findOne(exerciseId, userId);
    const html = this.buildHtml(exercise, font, showHeader);
    let browser: Browser | null = null;
    try {
      const puppeteerConfig = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      };

      this.logger.log('Launching Puppeteer with config:', puppeteerConfig);
      browser = await puppeteer.launch(puppeteerConfig);

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      await page.waitForFunction(
        () => typeof (window as any).katex !== 'undefined',
        { timeout: 10000 },
      );

      await page.evaluate(() => {
        const mathElements = document.querySelectorAll('.math, [data-math]');
        mathElements.forEach((el) => {
          try {
            const mathText =
              el.textContent || el.getAttribute('data-math') || '';
            if (mathText.trim()) {
              (window as any).katex.render(mathText, el, {
                throwOnError: false,
                displayMode:
                  el.tagName === 'DIV' || el.classList.contains('display-math'),
              });
            }
          } catch (e) {
            console.log('Math rendering error:', e);
          }
        });
        const content = document.getElementById('content');
        if (
          content &&
          typeof (window as any).renderMathInElement === 'function'
        ) {
          (window as any).renderMathInElement(content, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\(', right: '\\)', display: false },
              { left: '\\[', right: '\\]', display: true },
            ],
            throwOnError: false,
            strict: false,
          });
        }
      });

      // Wait for rendering to complete
      await page
        .waitForFunction(
          () => {
            const katexElements = document.querySelectorAll('.katex');
            return (
              katexElements.length > 0 &&
              Array.from(katexElements).every((el) => el.children.length > 0)
            );
          },
          { timeout: 5000 },
        )
        .catch(() => {
          // If no katex elements found, that's also OK
          console.log('No KaTeX elements found or timeout reached');
        });

      // Additional wait to ensure all styles are applied
      await new Promise((resolve) => setTimeout(resolve, 2000));

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

  private buildHtml(exercise: any, font?: string, showHeader = true): string {
    const baseFont = font || 'Cambria, "Times New Roman", serif';
    const headerHtml = showHeader
      ? `<div class="exercise-title"><h1>${this.escape(
          exercise.name || '',
        )}</h1></div>`
      : '';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />
<title>${this.escape(exercise.name || 'Exercise')}</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous" />
<style>
  body { 
    font-family: ${baseFont}; 
    font-size:14px; 
    line-height:1.5; 
    color:#222; 
  }
  
  /* Font family rules with proper weight inheritance */
  * { 
    font-family: ${baseFont} !important; 
  }
  
  /* Preserve font weights and styles */
  strong, b { 
    font-family: ${baseFont} !important; 
    font-weight: bold !important; 
  }
  
  em, i { 
    font-family: ${baseFont} !important; 
    font-style: italic !important; 
  }
  
  /* Headers with proper bold styling */
  h1, h2, h3, h4, h5, h6 { 
    font-family: ${baseFont} !important; 
    font-weight: bold !important; 
    margin: 0 0 .6em; 
  }
  
  /* Text elements */
  p, div, span, li, td, th { 
    font-family: ${baseFont} !important; 
  }
  
  /* Lists */
  ul, ol { 
    font-family: ${baseFont} !important; 
    padding-left: 1.3em; 
  }
  
  /* Blockquotes */
  blockquote { 
    font-family: ${baseFont} !important; 
    font-style: italic !important; 
  }
  
  /* Layout */
  .container { max-width: 800px; margin:0 auto; }
  .exercise-title { text-align:center; margin-bottom:20px; }
  .meta { font-size:12px; color:#555; margin-bottom:20px; }
  
  /* Tables */
  table { 
    width:100%; 
    border-collapse: collapse; 
    margin: 12px 0; 
    font-family: ${baseFont} !important; 
  }
  table, th, td { border:1px solid #666; }
  th, td { 
    padding:6px 8px; 
    font-family: ${baseFont} !important; 
  }
  th { 
    font-weight: bold !important; 
  }
  
  /* Code elements - keep monospace */
  code, pre { 
    font-family: 'Courier New', monospace !important; 
    background:#f5f5f5; 
    padding:2px 4px; 
    border-radius:4px; 
  }
  
  /* Math elements */
  .katex-display { margin: 1em 0; }
  .katex { font-size: 1.1em !important; }
  
  /* Ensure fraction lines are visible */
  .katex .frac-line { 
    border-bottom: 0.04em solid currentColor !important;
    height: 0.04em !important;
    background: currentColor !important;
  }
  .katex .mfrac .frac-line {
    border-bottom: 0.04em solid currentColor !important;
    height: 0.04em !important;
    background: currentColor !important;
  }
  .katex .mfrac > span {
    border-color: currentColor !important;
  }
  .katex .mfrac > span:nth-child(2) {
    border-top: 0.04em solid currentColor !important;
  }
  
  /* Additional bold preservation for common elements */
  .prose strong, 
  .prose b, 
  .content strong, 
  .content b {
    font-weight: bold !important;
  }
  
  hr { margin: 24px 0; }
</style>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.getElementById('content'), {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '\\(', right: '\\)', display: false},
          {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError: false,
        strict: false
      });
    }
  });
</script>
</head><body>
<div class="container">
  ${headerHtml}
  <div id="content">${exercise.content || ''}</div>
</div>
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
