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

    tempElement.innerHTML = headerContent + content;
    document.body.appendChild(tempElement);

    // Allow time for web fonts and math rendering libraries to process the content.
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(tempElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        // Preserve MathJax and KaTeX styles completely
        const allStyleElements = clonedDoc.querySelectorAll(
          'style, link[rel="stylesheet"]'
        );

        allStyleElements.forEach((element) => {
          const href = element.getAttribute("href") || "";
          const id = element.id || "";
          const textContent = element.textContent || "";

          const isKaTeX = href.includes("katex") || textContent.includes("katex");
          const isMathJax = id.includes("MathJax") || 
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
        const surgicalStyles = clonedDoc.createElement('style');
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
        `;
        clonedDoc.head.appendChild(surgicalStyles);
      },
    });

    document.body.removeChild(tempElement);

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");

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
    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    heightLeft -= availableHeight;

    // Add new pages if content overflows
    while (heightLeft > 0) {
      position -= availableHeight; // Move the drawing position up for the next slice
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
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
