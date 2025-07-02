import React, { useState, useRef } from "react";
import {
  Eye,
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  Download,
  FileText,
  Clock,
  Type,
} from "lucide-react";
import { InlineMath } from "react-katex";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { exercisesData } from "../../data/sampleData";
import { useAuth } from "../../contexts/AuthContext";

// Import KaTeX CSS
import "katex/dist/katex.min.css";

interface Exercise {
  id: number;
  name: string;
  subject: string;
  grade: number;
  deadline: string;
  note: string;
  content: string;
  latexContent: string;
  createdBy: string;
  createdAt: string;
  submissions: number;
  status: string;
}

export const ExercisePublicView: React.FC = () => {
  const { isTeacher } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [previewMode, setPreviewMode] = useState<
    "content" | "latex" | "reading"
  >("reading");
  const [selectedFont, setSelectedFont] = useState<string>("Cambria Math");
  const contentRef = useRef<HTMLDivElement>(null);

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

  const downloadAsPDF = async (exercise: Exercise) => {
    try {
      console.log("Starting PDF generation for:", exercise.name);

      // Create a temporary PDF preview element with completely isolated styles
      const tempElement = document.createElement("div");
      tempElement.style.position = "absolute";
      tempElement.style.left = "-9999px";
      tempElement.style.top = "0";
      tempElement.style.width = "794px"; // A4 width in pixels at 96 DPI
      tempElement.style.backgroundColor = "#ffffff";
      tempElement.style.padding = "40px";
      tempElement.style.minHeight = "1000px";
      tempElement.style.overflow = "visible";
      tempElement.style.fontFamily =
        popularFonts.find((font) => font.name === selectedFont)?.value ||
        '"Cambria Math", Cambria, serif';

      // Clean content - remove all classes and problematic attributes
      const cleanContent = exercise.content
        .replace(/class="[^"]*"/g, "") // Remove all CSS classes
        .replace(/style="[^"]*"/g, "") // Remove existing styles
        .replace(/oklch\([^)]*\)/g, "#374151") // Replace any oklch colors
        .replace(/rgb\([^)]*\)/g, "#374151") // Normalize colors
        .replace(/<([^>]+)>/g, (match, content) => {
          // Clean up any problematic attributes and add safe styles
          const tagName = content.split(" ")[0];
          if (tagName === "h1")
            return '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0 10px 0; color: #1f2937; background: #ffffff;">';
          if (tagName === "h2")
            return '<h2 style="font-size: 20px; font-weight: 600; margin: 16px 0 8px 0; color: #1f2937; background: #ffffff;">';
          if (tagName === "h3")
            return '<h3 style="font-size: 18px; font-weight: 500; margin: 12px 0 6px 0; color: #1f2937; background: #ffffff;">';
          if (tagName === "p")
            return '<p style="margin: 8px 0; color: #374151; background: #ffffff; line-height: 1.6;">';
          if (tagName === "strong")
            return '<strong style="font-weight: bold; color: #1f2937; background: #ffffff;">';
          if (tagName === "em")
            return '<em style="font-style: italic; color: #374151; background: #ffffff;">';
          if (tagName === "ul")
            return '<ul style="margin: 8px 0; padding-left: 20px; color: #374151; background: #ffffff;">';
          if (tagName === "ol")
            return '<ol style="margin: 8px 0; padding-left: 20px; color: #374151; background: #ffffff;">';
          if (tagName === "li")
            return '<li style="margin: 4px 0; color: #374151; background: #ffffff;">';
          return `<${tagName} style="color: #374151; background: #ffffff;">`;
        });

      tempElement.innerHTML = `
        <div style="font-family: ${
          popularFonts.find((font) => font.name === selectedFont)?.value ||
          '"Cambria Math", Cambria, serif'
        }; line-height: 1.8; color: #374151; background: #ffffff; padding: 0; margin: 0;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; background: #ffffff;">
            <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937; background: #ffffff;">${
              exercise.name
            }</h1>
            <div style="font-size: 14px; color: #6b7280; background: #ffffff;">
              <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937; background: #ffffff;">Môn học:</strong> ${
                exercise.subject
              }</p>
              <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937; background: #ffffff;">Lớp:</strong> ${
                exercise.grade
              }</p>
              <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937; background: #ffffff;">Hạn nộp:</strong> ${new Date(
                exercise.deadline
              ).toLocaleDateString("vi-VN")}</p>
              <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937; background: #ffffff;">Giáo viên:</strong> ${
                exercise.createdBy
              }</p>
              ${
                exercise.note
                  ? `<p style="margin: 15px 0 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937; background: #ffffff;">Ghi chú:</strong> ${exercise.note}</p>`
                  : ""
              }
            </div>
          </div>
          <div style="font-size: 18px; line-height: 1.8; background: #ffffff;">
            <div style="margin-bottom: 20px; background: #ffffff;">
              <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 15px 0; color: #1f2937; background: #ffffff;">Nội dung bài tập:</h2>
            </div>
            <div style="color: #374151; background: #ffffff; font-size: 18px; line-height: 1.8;">
              ${cleanContent}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempElement);
      console.log("Temporary element added to DOM");

      // Wait for fonts to load and DOM to settle
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 200));

      console.log("Starting html2canvas capture");

      // Capture as canvas with better error handling
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: Math.max(
          tempElement.scrollHeight,
          tempElement.offsetHeight,
          1000
        ),
        ignoreElements: (element) => {
          // Skip any elements that might have problematic styles
          const style = window.getComputedStyle(element);
          return (
            style.color.includes("oklch") ||
            style.backgroundColor.includes("oklch") ||
            element.classList?.contains("dark:") ||
            element.classList?.contains("prose")
          );
        },
        onclone: (clonedDoc) => {
          console.log("Cleaning cloned document");
          // Remove any problematic stylesheets and add our safe styles
          const styles = clonedDoc.querySelectorAll(
            'style, link[rel="stylesheet"]'
          );
          styles.forEach((style) => style.remove());

          // Add completely safe inline styles
          const safeStyle = clonedDoc.createElement("style");
          safeStyle.textContent = `
            * { 
              background-color: #ffffff !important; 
              border-color: #e5e7eb !important;
              box-shadow: none !important;
            }
            p, div, span, h1, h2, h3, h4, h5, h6, li { 
              color: #374151 !important; 
              background-color: #ffffff !important;
            }
            strong, b { 
              color: #1f2937 !important; 
              background-color: #ffffff !important;
            }
            body {
              background-color: #ffffff !important;
            }
          `;
          clonedDoc.head.appendChild(safeStyle);
        },
      });

      document.body.removeChild(tempElement);
      console.log(
        "Canvas created, dimensions:",
        canvas.width,
        "x",
        canvas.height
      );

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log("PDF dimensions:", { imgWidth, imgHeight, pageHeight });

      if (imgHeight <= pageHeight) {
        // Single page
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // Multiple pages
        let remainingHeight = imgHeight;
        let sourceY = 0;
        let pageNumber = 0;

        while (remainingHeight > 0) {
          const heightToUse = Math.min(pageHeight, remainingHeight);
          if (pageNumber > 0) pdf.addPage();

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
      console.log("PDF saved successfully:", fileName);
    } catch (error) {
      console.error("Detailed PDF Error:", error);

      // Fallback: Simple text-based PDF
      try {
        console.log("Attempting fallback PDF generation");
        const pdf = new jsPDF();

        // Set font
        pdf.setFontSize(16);
        pdf.text(exercise.name || "Bài tập", 20, 30);

        pdf.setFontSize(12);
        let yPos = 50;

        // Basic info
        const info = [
          `Môn học: ${exercise.subject}`,
          `Lớp: ${exercise.grade}`,
          `Hạn nộp: ${new Date(exercise.deadline).toLocaleDateString("vi-VN")}`,
          `Giáo viên: ${exercise.createdBy}`,
        ];

        info.forEach((line) => {
          pdf.text(line, 20, yPos);
          yPos += 10;
        });

        if (exercise.note) {
          yPos += 10;
          pdf.text("Ghi chú:", 20, yPos);
          yPos += 10;
          const noteLines = pdf.splitTextToSize(exercise.note, 170);
          noteLines.forEach((line: string) => {
            pdf.text(line, 20, yPos);
            yPos += 7;
          });
        }

        // Content (simplified)
        yPos += 15;
        pdf.text("Nội dung bài tập:", 20, yPos);
        yPos += 15;

        const simpleContent = exercise.content
          .replace(/<[^>]+>/g, " ") // Remove HTML tags
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim()
          .substring(0, 2000); // Limit content length

        const contentLines = pdf.splitTextToSize(simpleContent, 170);
        contentLines.forEach((line: string) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(line, 20, yPos);
          yPos += 7;
        });

        const fileName = `${exercise.name.replace(
          /[<>:"/\\|?*]/g,
          "_"
        )}_fallback.pdf`;
        pdf.save(fileName);
        console.log("Fallback PDF saved successfully");
      } catch (fallbackError) {
        console.error("Fallback PDF Error:", fallbackError);
        alert(
          "Không thể tạo PDF. Bạn có thể sử dụng Print của trình duyệt (Ctrl+P) để in/lưu PDF."
        );
      }
    }
  };

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedExercise(null);
  };

  // Exercise Detail View
  if (currentView === "detail" && selectedExercise) {
    const isNearDeadline =
      new Date(selectedExercise.deadline) <=
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
                      {selectedExercise.name}
                    </h1>
                    <p className="text-blue-100 mt-1">
                      {isTeacher ? "Xem chi tiết bài tập" : "Chi tiết bài tập"}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-3 mb-6">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    {selectedExercise.subject}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Lớp {selectedExercise.grade}
                  </span>
                  {selectedExercise.status === "active" && (
                    <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                      Đang mở
                    </span>
                  )}
                  {isNearDeadline && (
                    <span className="px-3 py-1 bg-red-500/30 rounded-full text-sm font-medium backdrop-blur-sm animate-pulse">
                      Sắp hết hạn
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => downloadAsPDF(selectedExercise)}
                  className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Tải PDF
                </button>
                <button
                  onClick={handleBackToList}
                  className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  ← Quay lại
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Hạn nộp</p>
                    <p className="text-white font-semibold">
                      {new Date(selectedExercise.deadline).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Bài nộp</p>
                    <p className="text-white font-semibold">
                      {selectedExercise.submissions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Ngày tạo</p>
                    <p className="text-white font-semibold">
                      {new Date(selectedExercise.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <GraduationCap className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">Giáo viên</p>
                    <p className="text-white font-semibold">
                      {selectedExercise.createdBy}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-8">
            {/* Exercise Note */}
            {selectedExercise.note && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-amber-100 rounded-xl mr-4">
                    <BookOpen className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Ghi chú quan trọng
                  </h3>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-6">
                  <p className="text-amber-800 text-lg leading-relaxed">
                    {selectedExercise.note}
                  </p>
                </div>
              </div>
            )}

            {/* Exercise Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {/* Content Header with Controls */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Nội dung bài tập
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Preview Mode Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewMode("reading")}
                      className={`flex items-center px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                        previewMode === "reading"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Chế độ đọc
                    </button>
                    <button
                      onClick={() => setPreviewMode("content")}
                      className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                        previewMode === "content"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Rich Text
                    </button>
                    {selectedExercise.subject === "Mathematics" &&
                      selectedExercise.latexContent && (
                        <button
                          onClick={() => setPreviewMode("latex")}
                          className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                            previewMode === "latex"
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          LaTeX
                        </button>
                      )}
                  </div>

                  {/* Font Selector - Only in reading mode */}
                  {previewMode === "reading" && (
                    <div className="flex items-center space-x-2">
                      <Type className="h-4 w-4 text-gray-500" />
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              {/* Content Display */}
              <div ref={contentRef}>
                {previewMode === "reading" ? (
                  // Reading Mode - Optimized for easy reading
                  <div className="max-w-none">
                    <div className="reading-mode-content bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                      <div className="bg-white rounded-lg p-8 shadow-sm">
                        <div
                          className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 content-text text-lg leading-loose"
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
                            __html: selectedExercise.content
                              .replace(
                                /<h1/g,
                                '<h1 class="text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4"'
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
                                '<pre class="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto"'
                              ),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : previewMode === "content" ? (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: selectedExercise.content,
                    }}
                  />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <div className="space-y-4">
                      {selectedExercise.latexContent &&
                        selectedExercise.latexContent
                          .split("\n")
                          .map((line, i) => {
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

                {!selectedExercise.content &&
                  !selectedExercise.latexContent && (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Bài tập chưa có nội dung</p>
                    </div>
                  )}
              </div>
            </div>

            {/* Action Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Sẵn sàng làm bài?
                    </h4>
                    <p className="text-gray-600">
                      Hoàn thành bài tập và nộp trước hạn chót
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {!isTeacher && (
                    <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold">
                      Nộp bài tập
                    </button>
                  )}
                  {isTeacher && (
                    <div className="flex space-x-4">
                      <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Xem bài nộp
                      </button>
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold">
                        Chấm điểm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exercise List View
  return (
    <div className="p-4">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bài tập từ giáo viên
          </h1>
          <p className="text-gray-600 mt-2">
            Xem và hoàn thành các bài tập được giao bởi giáo viên
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tổng bài tập
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {exercisesData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang mở</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {exercisesData.filter((ex) => ex.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Đã hoàn thành
                </p>
                <p className="text-2xl font-semibold text-gray-900">7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {exercisesData.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Lớp {exercise.grade}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {exercise.subject}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      Hạn:{" "}
                      {new Date(exercise.deadline).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{exercise.submissions} bài nộp</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">GV:</span>{" "}
                    {exercise.createdBy}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    exercise.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {exercise.status === "active" ? "Đang mở" : "Đã đóng"}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {exercise.note}
              </p>

              <button
                onClick={() => handleViewExercise(exercise)}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isTeacher ? "Xem chi tiết" : "Xem và làm bài"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
