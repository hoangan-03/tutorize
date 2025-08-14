import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Exercise } from "../types/api";

interface FontConfig {
  name: string;
  value: string;
}

interface PDFGeneratorOptions {
  selectedFont?: string;
  popularFonts: FontConfig[];
  showHeader?: boolean;
  headerInfo?: {
    subject?: string;
    grade?: string;
    deadline?: string;
    teacher?: string;
    note?: string;
  };
  formatDate?: (date: string) => string;
}

// Helper function to split content into smaller chunks for large documents
const splitContentIntoChunks = (
  content: string,
  maxLength: number = 2000 // Much smaller chunks
): string[] => {
  if (content.length <= maxLength) {
    return [content];
  }

  const chunks: string[] = [];
  const paragraphs = content.split("</p>");
  let currentChunk = "";

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i] + (i < paragraphs.length - 1 ? "</p>" : "");

    if (
      (currentChunk + paragraph).length > maxLength &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += paragraph;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};

// Fallback function for extremely large content - generates text-only PDF
const generateTextOnlyPDF = async (
  exercise: Exercise,
  options: PDFGeneratorOptions
): Promise<void> => {
  const {
    showHeader = false,
    headerInfo = {},
    formatDate = (date: string) => new Date(date).toLocaleDateString(),
  } = options;

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = pageWidth - 2 * margin;

    let yPosition = margin;

    // Add header if needed
    if (showHeader) {
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(exercise.name || "Exercise", margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");

      if (headerInfo.subject) {
        pdf.text(`Môn học: ${headerInfo.subject}`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (headerInfo.grade) {
        pdf.text(`Lớp: ${headerInfo.grade}`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (headerInfo.deadline) {
        pdf.text(
          `Hạn nộp: ${formatDate(headerInfo.deadline)}`,
          margin,
          yPosition
        );
        yPosition += lineHeight;
      }
      if (headerInfo.teacher) {
        pdf.text(`Giáo viên: ${headerInfo.teacher}`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (headerInfo.note) {
        pdf.text(`Ghi chú: ${headerInfo.note}`, margin, yPosition);
        yPosition += lineHeight;
      }

      yPosition += 10; // Extra space before content
    }

    // Strip HTML tags and convert to plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = exercise.content || "";
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    // Split text into lines that fit the page width
    const words = plainText.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = pdf.getTextWidth(testLine);

      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    // Add text to PDF with page breaks
    for (const line of lines) {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    }

    const fileName = `${(exercise.name || "exercise").replace(
      /[<>:"/\\|?*]/g,
      "_"
    )}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to generate text-only PDF:", error);
    alert(
      "Nội dung quá lớn để tạo PDF với định dạng. Đã tạo PDF dạng text thuần."
    );
  }
};

// Helper function to generate PDF for large content by processing chunks
const generateLargeContentPDF = async (
  exercise: Exercise,
  contentChunks: string[],
  headerContent: string,
  tempElement: HTMLDivElement,
  _options: PDFGeneratorOptions // Add underscore to indicate unused parameter
): Promise<void> => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const availableWidth = pageWidth - 2 * margin;

  let isFirstPage = true;

  for (let i = 0; i < contentChunks.length; i++) {
    const chunk = contentChunks[i];
    const chunkContent = (i === 0 ? headerContent : "") + chunk;

    tempElement.innerHTML = chunkContent;
    document.body.appendChild(tempElement);

    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(tempElement, {
        scale: 0.8, // Much lower scale to reduce payload size
        useCORS: true,
        backgroundColor: "#ffffff",
        height: Math.min(tempElement.scrollHeight, 1500), // Much smaller height limit
        width: Math.min(tempElement.scrollWidth, 800), // Much smaller width limit
        onclone: (clonedDoc) => {
          // Apply the same styling fixes as the main function
          const allStyleElements = clonedDoc.querySelectorAll(
            'style, link[rel="stylesheet"]'
          );
          allStyleElements.forEach((element) => {
            const href = element.getAttribute("href") || "";
            const id = element.id || "";
            const textContent = element.textContent || "";
            const isKaTeX =
              href.includes("katex") || textContent.includes("katex");
            const isMathJax =
              id.includes("MathJax") ||
              textContent.includes("MJX") ||
              textContent.includes("mjx") ||
              textContent.includes("MathJax");
            if (!isKaTeX && !isMathJax) {
              element.remove();
            }
          });

          const surgicalStyles = clonedDoc.createElement("style");
          surgicalStyles.textContent = `
            .mjx-line { border-color: black !important; }
            .mjx-math, .mjx-math * { opacity: 1 !important; visibility: visible !important; }
            strong, b { font-weight: bold !important; color: black !important; }
            em, i { font-style: italic !important; }
            ol { list-style-type: none !important; padding-left: 0 !important; margin-left: 20px !important; }
            ul { list-style-type: disc !important; margin-left: 20px !important; }
            * { color: black !important; background-color: white !important; border-color: #ccc !important; }
            h1, h2, h3, h4, h5, h6 { color: black !important; }
            div, p, span, li, ol, ul { background-color: transparent !important; border-color: #ccc !important; }
          `;
          clonedDoc.head.appendChild(surgicalStyles);
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.5); // Higher compression
      const imgWidth = availableWidth;
      const imgHeight = (canvas.height * availableWidth) / canvas.width;

      if (!isFirstPage) {
        pdf.addPage();
      }

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        margin,
        imgWidth,
        Math.min(imgHeight, pageHeight - 2 * margin)
      );
      isFirstPage = false;
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
    }

    document.body.removeChild(tempElement);
  }

  const fileName = `${(exercise.name || "exercise").replace(
    /[<>:"/\\|?*]/g,
    "_"
  )}.pdf`;
  pdf.save(fileName);
};

export const generateExercisePDF = async (
  exercise: Exercise,
  options: PDFGeneratorOptions
): Promise<void> => {
  const {
    selectedFont = "Cambria Math",
    popularFonts,
    showHeader = false,
    headerInfo = {},
    formatDate = (date: string) => new Date(date).toLocaleDateString(),
  } = options;

  try {
    const tempElement = document.createElement("div");
    // Setup a temporary element to render the HTML off-screen
    tempElement.style.position = "absolute";
    tempElement.style.left = "-9999px"; // Move it off-screen
    tempElement.style.top = "0";
    tempElement.style.width = "210mm"; // A4 width
    tempElement.style.backgroundColor = "white";
    tempElement.style.padding = "20mm";
    tempElement.style.minHeight = "297mm"; // A4 height in mm
    tempElement.style.boxSizing = "border-box";
    tempElement.style.fontFamily =
      popularFonts.find((font) => font.name === selectedFont)?.value ||
      '"Cambria Math", Cambria, serif';

    // The raw content, which includes MathJax/KaTeX markup
    const content = exercise.content || "";

    // Check if content is too long and needs to be split
    const contentChunks = splitContentIntoChunks(content, 1500); // Much smaller threshold
    const isLargeContent = contentChunks.length > 1;

    // If content is extremely large, use text-only fallback
    if (content.length > 10000) {
      await generateTextOnlyPDF(exercise, options);
      return;
    }

    // Create header content if needed
    const headerContent = showHeader
      ? `
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 15px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">${
          exercise.name || ""
        }</h1>
        <div style="font-size: 14px; color: #555;">
          ${
            headerInfo.subject
              ? `<p style="margin: 4px 0;"><strong>Môn học:</strong> ${headerInfo.subject}</p>`
              : ""
          }
          ${
            headerInfo.grade
              ? `<p style="margin: 4px 0;"><strong>Lớp:</strong> ${headerInfo.grade}</p>`
              : ""
          }
          ${
            headerInfo.deadline
              ? `<p style="margin: 4px 0;"><strong>Hạn nộp:</strong> ${formatDate(
                  headerInfo.deadline
                )}</p>`
              : ""
          }
          ${
            headerInfo.teacher
              ? `<p style="margin: 4px 0;"><strong>Giáo viên:</strong> ${headerInfo.teacher}</p>`
              : ""
          }
           ${
             headerInfo.note
               ? `<p style="margin: 10px 0 4px 0;"><strong>Ghi chú:</strong> ${headerInfo.note}</p>`
               : ""
           }
        </div>
      </div>
      <h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 15px 0;">Nội dung bài tập:</h2>
    `
      : "";

    // For large content, process in chunks
    if (isLargeContent) {
      await generateLargeContentPDF(
        exercise,
        contentChunks,
        headerContent,
        tempElement,
        options
      );
      return;
    }

    tempElement.innerHTML = headerContent + content;
    document.body.appendChild(tempElement);

    // Allow time for web fonts and math rendering libraries to process the content.
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(tempElement, {
      scale: 1.0, // Further reduced scale for regular content
      useCORS: true,
      backgroundColor: "#ffffff",
      height: Math.min(tempElement.scrollHeight, 2500), // Much smaller height limit
      width: Math.min(tempElement.scrollWidth, 1200), // Much smaller width limit
      onclone: (clonedDoc) => {
        // Preserve MathJax and KaTeX styles completely
        const allStyleElements = clonedDoc.querySelectorAll(
          'style, link[rel="stylesheet"]'
        );

        allStyleElements.forEach((element) => {
          const href = element.getAttribute("href") || "";
          const id = element.id || "";
          const textContent = element.textContent || "";

          const isKaTeX =
            href.includes("katex") || textContent.includes("katex");
          const isMathJax =
            id.includes("MathJax") ||
            textContent.includes("MJX") ||
            textContent.includes("mjx") ||
            textContent.includes("MathJax");

          if (!isKaTeX && !isMathJax) {
            element.remove();
          }
        });

        // --- Final Surgical Styling Fix ---
        // This is the most minimal approach. We trust MathJax's inline styles for positioning
        // and only override the properties that html2canvas seems to be losing.
        const surgicalStyles = clonedDoc.createElement("style");
        surgicalStyles.textContent = `
          /* 
            The key is to NOT override display or position. MathJax uses a mix of
            inline-block, absolute positioning, and other tricks. Overriding them breaks the layout.
            We only force the properties that seem to get lost in translation.
          */

          /* 1. Make the fraction line visible. It might be rendered with a transparent color. */
          .mjx-line {
            border-color: black !important;
          }

          /* 2. Ensure all parts of the math are actually visible. */
          .mjx-math, .mjx-math * {
            opacity: 1 !important;
            visibility: visible !important;
          }

          /* 3. Preserve bold and italic text, as before. */
          strong, b { font-weight: bold !important; }
          em, i { font-style: italic !important; }

          /* 4. Remove automatic numbering from ordered lists to prevent duplicate numbering */
          ol {
            list-style-type: none !important;
            padding-left: 0 !important;
            margin-left: 20px !important;
          }
          
          ul {
            list-style-type: disc !important;
            margin-left: 20px !important;
          }

          /* 5. Override oklch colors that html2canvas doesn't support */
          * {
            color: black !important;
            background-color: white !important;
            border-color: #ccc !important;
          }

          /* Preserve specific styling for common elements */
          strong, b {
            color: black !important;
          }

          h1, h2, h3, h4, h5, h6 {
            color: black !important;
          }

          /* Reset any potential oklch usage in backgrounds or borders */
          div, p, span, li, ol, ul {
            background-color: transparent !important;
            border-color: #ccc !important;
          }
        `;
        clonedDoc.head.appendChild(surgicalStyles);
      },
    });

    document.body.removeChild(tempElement);

    const pdf = new jsPDF("p", "mm", "a4");
    // Use JPEG with higher compression to reduce file size
    const imgData = canvas.toDataURL("image/jpeg", 0.6);

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 15; // PDF margin
    const availableWidth = pageWidth - 2 * margin;
    const availableHeight = pageHeight - 2 * margin;

    const imgWidth = availableWidth;
    const imgHeight = (canvas.height * availableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add the first page, starting at the top
    pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);
    heightLeft -= availableHeight;

    // Add new pages if content overflows
    while (heightLeft > 0) {
      position -= availableHeight; // Move the drawing position up for the next slice
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
      heightLeft -= availableHeight;
    }

    const fileName = `${(exercise.name || "exercise").replace(
      /[<>:"/\\|?*]/g,
      "_"
    )}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    alert("Could not generate PDF. Please check the console for more details.");
  }
};
