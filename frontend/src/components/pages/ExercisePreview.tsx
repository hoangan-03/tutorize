import React, { useRef } from "react";
import {
  Edit,
  Download,
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Eye,
  Type,
} from "lucide-react";
import { InlineMath } from "react-katex";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Exercise, Subject } from "../../types/api";
import { formatDate } from "../utils";

interface ExercisePreviewProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit?: () => void;
  isReadOnly?: boolean;
}

export const ExercisePreview: React.FC<ExercisePreviewProps> = ({
  exercise,
  onBack,
  onEdit,
  isReadOnly = false,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [previewMode, setPreviewMode] = React.useState<
    "content" | "latex" | "reading"
  >("reading");

  const [selectedFont, setSelectedFont] =
    React.useState<string>("Cambria Math");

  const popularFonts = [
    { name: "Cambria Math", value: '"Cambria Math", Cambria, serif' },
    { name: "Times New Roman", value: '"Times New Roman", Times, serif' },
    { name: "Georgia", value: 'Georgia, "Times New Roman", serif' },
    { name: "Arial", value: "Arial, Helvetica, sans-serif" },
    { name: "Calibri", value: 'Calibri, "Segoe UI", sans-serif' },
    { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
    { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
    { name: "Palatino", value: '"Palatino Linotype", Palatino, serif' },
    { name: "Book Antiqua", value: '"Book Antiqua", Palatino, serif' },
    { name: "Garamond", value: 'Garamond, "Times New Roman", serif' },
  ];

  const downloadAsPDF = async () => {
    try {
      const tempElement = document.createElement("div");
      tempElement.style.position = "absolute";
      tempElement.style.left = "-9999px";
      tempElement.style.top = "0";
      tempElement.style.width = "794px";
      tempElement.style.backgroundColor = "white";
      tempElement.style.padding = "40px";
      tempElement.style.minHeight = "1000px";
      tempElement.style.overflow = "visible";
      tempElement.style.fontFamily =
        popularFonts.find((font) => font.name === selectedFont)?.value ||
        '"Cambria Math", Cambria, serif';

      const cleanContent = exercise.content
        .replace(/class="[^"]*"/g, "")
        .replace(/style="[^"]*"/g, "")
        .replace(/<([^>]+)>/g, (_match, content) => {
          return `<${content
            .replace(/class="[^"]*"/g, "")
            .replace(/style="[^"]*"/g, "")}>`;
        });

      tempElement.innerHTML = `
         <div style="font-family: ${
           popularFonts.find((font) => font.name === selectedFont)?.value ||
           '"Cambria Math", Cambria, serif'
         }; line-height: 1.8; color: #374151; background: #ffffff;">
           <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; background: #ffffff;">
             <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937; background: #ffffff;">${
               exercise.name
             }</h1>
             <div style="font-size: 14px; color: #6b7280; background: #ffffff;">
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">Môn học:</strong> ${
                 exercise.subject
               }</p>
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">Lớp:</strong> ${
                 exercise.grade
               }</p>
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">Hạn nộp:</strong> ${formatDate(
                 exercise.deadline
               )}</p>
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">Giáo viên:</strong> ${
                 exercise.createdBy
               }</p>
               ${
                 exercise.note
                   ? `<p style="margin: 15px 0 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">Ghi chú:</strong> ${exercise.note}</p>`
                   : ""
               }
             </div>
           </div>
           <div style="font-size: 18px; line-height: 1.8; background: #ffffff;">
             <div style="margin-bottom: 20px; background: #ffffff;">
               <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 15px 0; color: #1f2937; background: #ffffff;">Nội dung bài tập:</h2>
             </div>
             <div style="color: #374151; background: #ffffff; font-size: 18px; line-height: 1.8;">
               ${cleanContent}
             </div>
           </div>
         </div>
       `;

      document.body.appendChild(tempElement);

      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 100));

      tempElement.style.height = "auto";
      const actualHeight = Math.max(
        tempElement.scrollHeight,
        tempElement.offsetHeight,
        1000
      );

      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: actualHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          return (
            element.tagName === "STYLE" ||
            element.tagName === "LINK" ||
            element.classList?.contains("tailwind") ||
            element.classList?.contains("prose")
          );
        },
        onclone: (clonedDoc) => {
          const styles = clonedDoc.querySelectorAll(
            'style, link[rel="stylesheet"]'
          );
          styles.forEach((style) => style.remove());

          const safeStyle = clonedDoc.createElement("style");
          safeStyle.textContent = `
             * { 
               background-color: #ffffff !important; 
               border-color: #e5e7eb !important;
             }
             p, div, span, h1, h2, h3, h4, h5, h6 { 
               color: #374151 !important; 
               background-color: #ffffff !important;
             }
             strong, b { 
               color: #1f2937 !important; 
               background-color: #ffffff !important;
             }
           `;
          clonedDoc.head.appendChild(safeStyle);
        },
      });

      document.body.removeChild(tempElement);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let sourceY = 0;
        let pageNumber = 0;

        while (remainingHeight > 0) {
          const heightToUse = Math.min(pageHeight, remainingHeight);

          if (pageNumber > 0) {
            pdf.addPage();
          }

          const sourceHeight = (heightToUse * canvas.height) / imgHeight;

          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext("2d");

          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceHeight,
              0,
              0,
              canvas.width,
              sourceHeight
            );

            const pageImgData = pageCanvas.toDataURL("image/png");
            pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, heightToUse);
          }

          sourceY += sourceHeight;
          remainingHeight -= heightToUse;
          pageNumber++;
        }
      }

      const fileName = `${exercise.name.replace(/[<>:"/\\|?*]/g, "_")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Error:", error);

      try {
        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text(exercise.name, 20, 30);

        pdf.setFontSize(12);
        pdf.text(`Mon hoc: ${exercise.subject}`, 20, 50);
        pdf.text(`Lop: ${exercise.grade}`, 20, 65);
        pdf.text(`Han nop: ${formatDate(exercise.deadline)}`, 20, 80);
        pdf.text(`Giao vien: ${exercise.createdBy}`, 20, 95);

        const simpleContent = exercise.content
          .replace(/<[^>]+>/g, " ")
          .replace(/[^\u0020-\u007E]/g, "?")
          .substring(0, 1000);

        const lines = pdf.splitTextToSize(simpleContent, 170);
        let y = 120;
        lines.forEach((line: string) => {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
          pdf.text(line, 20, y);
          y += 7;
        });

        pdf.save(`${exercise.name.replace(/[^\w]/g, "_")}.pdf`);
      } catch (fallbackError) {
        console.error("Fallback PDF Error:", fallbackError);
        alert(
          "Không thể tạo PDF. Bạn có thể sử dụng Print của trình duyệt (Ctrl+P) để in/lưu PDF."
        );
      }
    }
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Quay lại
          </button>
          <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900">
            Xem bài tập
          </h1>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={downloadAsPDF}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Tải PDF
          </button>
          {!isReadOnly && onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-100">
              Thông tin bài tập
            </h2>

            <div className="space-y-5">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Môn học
                  </span>
                </div>
                <div className="font-semibold text-blue-800 text-base">
                  {exercise.subject}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center mb-2">
                  <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Lớp học
                  </span>
                </div>
                <div className="font-semibold text-green-800 text-base">
                  Lớp {exercise.grade}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    Hạn nộp
                  </span>
                </div>
                <div className="font-semibold text-red-800 text-base">
                  {formatDate(exercise.deadline)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Giáo viên
                  </span>
                </div>
                <div className="font-semibold text-gray-800 text-base">
                  {exercise.createdBy}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="text-xs font-medium text-purple-900 mb-1">
                    Ngày tạo
                  </div>
                  <div className="font-semibold text-purple-800 text-sm">
                    {formatDate(exercise.createdAt)}
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                  <div className="text-xs font-medium text-indigo-900 mb-1">
                    Bài nộp
                  </div>
                  <div className="font-semibold text-indigo-800 text-sm">
                    {exercise.submissions}
                  </div>
                </div>
              </div>
            </div>

            {exercise.note && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm font-medium text-amber-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Ghi chú
                </div>
                <div className="text-sm text-amber-800 leading-relaxed">
                  {exercise.note}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {exercise.name}
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewMode("reading")}
                      className={`flex items-center px-3 py-1 text-sm rounded ${
                        previewMode === "reading"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Chế độ đọc
                    </button>
                    <button
                      onClick={() => setPreviewMode("content")}
                      className={`px-3 py-1 text-sm rounded ${
                        previewMode === "content"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Rich Text
                    </button>
                    {exercise.subject === Subject.MATH &&
                      exercise.latexContent && (
                        <button
                          onClick={() => setPreviewMode("latex")}
                          className={`px-3 py-1 text-sm rounded ${
                            previewMode === "latex"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          LaTeX
                        </button>
                      )}
                  </div>

                  {previewMode === "reading" && (
                    <div className="flex items-center space-x-2 border-l border-gray-300 pl-3">
                      <Type className="h-4 w-4 text-gray-500" />
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        aria-label="Chọn font chữ"
                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {popularFonts.map((font) => (
                          <option key={font.name} value={font.name}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div ref={contentRef} className="p-6">
              {previewMode === "reading" ? (
                <div className="max-w-none">
                  <div className="reading-mode-content bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                    <div className="bg-white rounded-lg p-8 shadow-sm">
                      <div className="prose prose-lg max-w-none text-start prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900">
                        <div
                          className="content-text text-lg leading-loose"
                          style={{
                            fontFamily:
                              popularFonts.find(
                                (font) => font.name === selectedFont
                              )?.value ||
                              '"Cambria Math", Cambria, "Times New Roman", serif',
                            lineHeight: "1.8",
                            fontSize: "18px",
                            color: "#374151",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: exercise.content
                              .replace(
                                /<h1/g,
                                '<h1 class="text-base md:text-xl lg:text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4"'
                              )
                              .replace(
                                /<h2/g,
                                '<h2 class="text-2xl font-semibold mb-4 mt-8 text-gray-800"'
                              )
                              .replace(
                                /<h3/g,
                                '<h3 class="text-xl font-medium mb-3 mt-6 text-gray-800"'
                              )
                              .replace(
                                /<p/g,
                                '<p class="mb-4 text-gray-700 leading-relaxed"'
                              )
                              .replace(
                                /<ul/g,
                                '<ul class="mb-4 pl-6 space-y-2"'
                              )
                              .replace(
                                /<ol/g,
                                '<ol class="mb-4 pl-6 space-y-2"'
                              )
                              .replace(/<li/g, '<li class="text-gray-700"')
                              .replace(
                                /<strong/g,
                                '<strong class="font-semibold text-gray-900"'
                              )
                              .replace(
                                /<em/g,
                                '<em class="italic text-gray-800"'
                              )
                              .replace(
                                /<blockquote/g,
                                '<blockquote class="border-l-4 border-blue-300 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700"'
                              )
                              .replace(
                                /<code/g,
                                '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800"'
                              )
                              .replace(
                                /<pre/g,
                                '<pre class="bg-gray-100 p-8 rounded-lg mb-4 overflow-x-auto"'
                              ),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : previewMode === "content" ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: exercise.content }}
                />
              ) : (
                <div className="prose max-w-none">
                  <div className="space-y-4">
                    {exercise.latexContent?.split("\n").map((line, i) => {
                      if (line.includes("$") && !line.includes("$$")) {
                        const parts = line.split("$");
                        return (
                          <p key={i}>
                            {parts.map((part, idx) =>
                              idx % 2 === 0 ? (
                                part
                              ) : (
                                <InlineMath key={idx} math={part} />
                              )
                            )}
                          </p>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>
              )}

              {!exercise.content && !exercise.latexContent && (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Bài tập chưa có nội dung</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
