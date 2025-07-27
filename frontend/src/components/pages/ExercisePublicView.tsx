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
  BookCheck,
  CalendarClock,
} from "lucide-react";
import { InlineMath } from "react-katex";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useExercises } from "../../hooks/useExercise";
import { Exercise } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";

// Import KaTeX CSS
import "katex/dist/katex.min.css";

export const ExercisePublicView: React.FC = () => {
  const { isTeacher } = useAuth();
  const { t } = useTranslation();
  const { exercises, isLoading } = useExercises();
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
      // Create a temporary PDF preview element
      const tempElement = document.createElement("div");
      tempElement.style.position = "absolute";
      tempElement.style.left = "-9999px";
      tempElement.style.top = "0";
      tempElement.style.width = "794px"; // A4 width in pixels at 96 DPI
      tempElement.style.backgroundColor = "white";
      tempElement.style.padding = "40px";
      tempElement.style.minHeight = "1000px"; // Ensure minimum height
      tempElement.style.overflow = "visible";
      tempElement.style.fontFamily =
        popularFonts.find((font) => font.name === selectedFont)?.value ||
        '"Cambria Math", Cambria, serif';

      // Safely get exercise content
      const exerciseContent = exercise.content || "";

      // Create PDF content with safe hex colors (no oklch)
      const cleanContent = exerciseContent
        .replace(/class="[^"]*"/g, "") // Remove all CSS classes
        .replace(/style="[^"]*"/g, "") // Remove existing styles
        .replace(/<([^>]+)>/g, (_match, content) => {
          // Clean up any problematic attributes
          return `<${content
            .replace(/class="[^"]*"/g, "")
            .replace(/style="[^"]*"/g, "")}>`;
        });

      const exerciseTitle = (
        exercise.name || t("exercisePublicView.defaultTitle")
      ).toString();
      const exerciseSubject = (
        exercise.subject || t("exercisePublicView.defaultSubject")
      ).toString();
      const exerciseGrade = (
        exercise.grade || t("exercisePublicView.defaultGrade")
      ).toString();
      const exerciseDeadline =
        exercise.deadline || exercise.createdAt || new Date().toISOString();
      const exerciseTeacher = (
        exercise.creator?.name || t("exercisePublicView.defaultTeacher")
      ).toString();
      const exerciseNote = (exercise.note || "").toString();

      tempElement.innerHTML = `
         <div style="font-family: ${
           popularFonts.find((font) => font.name === selectedFont)?.value ||
           '"Cambria Math", Cambria, serif'
         }; line-height: 1.8; color: #374151; background: #ffffff;">
           <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; background: #ffffff;">
             <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937; background: #ffffff;">${exerciseTitle}</h1>
             <div style="font-size: 14px; color: #6b7280; background: #ffffff;">
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">${t(
                 "exercisePublicView.subject"
               )}:</strong> ${exerciseSubject}</p>
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">${t(
                 "exercisePublicView.grade"
               )}:</strong> ${exerciseGrade}</p>
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">${t(
                 "exercisePublicView.deadline"
               )}:</strong> ${new Date(exerciseDeadline).toLocaleDateString(
        "vi-VN"
      )}</p>
               <p style="margin: 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">${t(
                 "exercisePublicView.teacher"
               )}:</strong> ${exerciseTeacher}</p>
               ${
                 exerciseNote && exerciseNote.trim()
                   ? `<p style="margin: 15px 0 5px 0; color: #374151; background: #ffffff;"><strong style="color: #1f2937;">${t(
                       "exercisePublicView.note"
                     )}:</strong> ${exerciseNote}</p>`
                   : ""
               }
             </div>
           </div>
           <div style="font-size: 18px; line-height: 1.8; background: #ffffff;">
             <div style="margin-bottom: 20px; background: #ffffff;">
               <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 15px 0; color: #1f2937; background: #ffffff;">${t(
                 "exercisePublicView.content"
               )}:</h2>
             </div>
             <div style="color: #374151; background: #ffffff; font-size: 18px; line-height: 1.8;">
               ${cleanContent || `<p>${t("exercisePublicView.noContent")}</p>`}
             </div>
           </div>
         </div>
       `;

      document.body.appendChild(tempElement);

      // Wait for fonts to load and DOM to settle
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force layout calculation and get accurate height
      tempElement.style.height = "auto";
      const actualHeight = Math.max(
        tempElement.scrollHeight,
        tempElement.offsetHeight,
        1000
      );

      console.log("Element dimensions:", {
        scrollHeight: tempElement.scrollHeight,
        offsetHeight: tempElement.offsetHeight,
        actualHeight: actualHeight,
      });

      // Capture the element as canvas with high quality
      const canvas = await html2canvas(tempElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: actualHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Skip elements that might cause oklch issues
          return (
            element.tagName === "STYLE" ||
            element.tagName === "LINK" ||
            element.classList?.contains("tailwind") ||
            element.classList?.contains("prose")
          );
        },
        onclone: (clonedDoc) => {
          // Remove any problematic stylesheets
          const styles = clonedDoc.querySelectorAll(
            'style, link[rel="stylesheet"]'
          );
          styles.forEach((style) => style.remove());

          // Add safe inline styles
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

      // Remove temporary element
      document.body.removeChild(tempElement);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log("PDF dimensions:", {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        imgWidth: imgWidth,
        imgHeight: imgHeight,
        pageHeight: pageHeight,
        pagesNeeded: Math.ceil(imgHeight / pageHeight),
      });

      if (imgHeight <= pageHeight) {
        // Single page - content fits
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // Multiple pages needed
        let remainingHeight = imgHeight;
        let sourceY = 0;
        let pageNumber = 0;

        while (remainingHeight > 0) {
          const heightToUse = Math.min(pageHeight, remainingHeight);

          if (pageNumber > 0) {
            pdf.addPage();
          }

          // Calculate source position and size for this page
          const sourceHeight = (heightToUse * canvas.height) / imgHeight;

          // Create a temporary canvas for this page slice
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
              sourceHeight, // source
              0,
              0,
              canvas.width,
              sourceHeight // destination
            );

            const pageImgData = pageCanvas.toDataURL("image/png");
            pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, heightToUse);
          }

          sourceY += sourceHeight;
          remainingHeight -= heightToUse;
          pageNumber++;
        }
      }

      // Save PDF with safe filename
      const safeFileName = exerciseTitle
        .replace(/[<>:"/\\|?*]/g, "_")
        .substring(0, 50); // Limit length
      pdf.save(`${safeFileName}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);

      // Fallback: Try simple text-based PDF
      try {
        const pdf = new jsPDF();

        // Safely get title for fallback
        const fallbackTitle = (
          exercise.name || t("exercisePublicView.defaultTitle")
        ).toString();
        const fallbackSubject = (
          exercise.subject || t("exercisePublicView.defaultSubject")
        ).toString();
        const fallbackGrade = (
          exercise.grade || t("exercisePublicView.defaultGrade")
        ).toString();
        const fallbackTeacher = (
          exercise.creator?.name || t("exercisePublicView.defaultTeacher")
        ).toString();
        const fallbackDeadline =
          exercise.deadline || exercise.createdAt || new Date().toISOString();
        const fallbackContent =
          exercise.content || t("exercisePublicView.noContent");

        pdf.setFontSize(16);
        pdf.text(fallbackTitle, 20, 30);

        pdf.setFontSize(12);
        pdf.text(
          `${t("exercisePublicView.subject")}: ${fallbackSubject}`,
          20,
          50
        );
        pdf.text(`${t("exercisePublicView.grade")}: ${fallbackGrade}`, 20, 65);
        pdf.text(
          `${t("exercisePublicView.deadline")}: ${new Date(
            fallbackDeadline
          ).toLocaleDateString()}`,
          20,
          80
        );
        pdf.text(
          `${t("exercisePublicView.teacher")}: ${fallbackTeacher}`,
          20,
          95
        );

        // Simple content without Vietnamese chars
        const simpleContent = fallbackContent
          .replace(/<[^>]+>/g, " ")
          .replace(/[^\u0020-\u007E]/g, "?") // Replace non-printable ASCII with ?
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

        const safeFileName = fallbackTitle
          .replace(/[^\w\s-]/g, "_")
          .substring(0, 50);
        pdf.save(`${safeFileName}.pdf`);
      } catch (fallbackError) {
        console.error("Fallback PDF Error:", fallbackError);
        // Final fallback to browser print
        alert(t("exercisePublicView.printFallback"));
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
      new Date(selectedExercise.deadline || selectedExercise.createdAt) <=
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const exerciseTitle = selectedExercise.name;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-sky-700 to-sky-900 rounded-2xl shadow-xl text-white p-4 md:p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{exerciseTitle}</h1>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-3 mb-6">
                  <Badge
                    variant="subject"
                    className="bg-white/20 text-white rounded-full backdrop-blur-sm border-0"
                  >
                    {t(`subject.${selectedExercise.subject.toLowerCase()}`)}
                  </Badge>
                  <Badge
                    variant="grade"
                    className="bg-white/20 text-white rounded-full backdrop-blur-sm border-0"
                  >
                    {t("exercises.class")} {selectedExercise.grade}
                  </Badge>
                  {selectedExercise.status === "ACTIVE" && (
                    <span className="px-3 py-1 bg-green-700/30 rounded-full text-sm font-medium backdrop-blur-sm">
                      {t("exercises.open")}
                    </span>
                  )}
                  {isNearDeadline && (
                    <span className="px-3 py-1 bg-red-700/30 rounded-full text-sm font-medium backdrop-blur-sm animate-pulse">
                      {t("exercises.nearDeadline")}
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
                  {t("exercises.downloadPDF")}
                </button>
                <button
                  onClick={handleBackToList}
                  className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  ← {t("common.back")}
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">
                      {t("exercises.deadline")}
                    </p>
                    <p className="text-white font-semibold">
                      {new Date(
                        selectedExercise.deadline || selectedExercise.createdAt
                      ).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">
                      {t("exercises.submissions")}
                    </p>
                    <p className="text-white font-semibold">
                      {selectedExercise.submissions || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">
                      {t("exercises.createdAt")}
                    </p>
                    <p className="text-white font-semibold">
                      {new Date(selectedExercise.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
                <div className="flex items-center">
                  <GraduationCap className="h-6 w-6 text-white mr-3" />
                  <div>
                    <p className="text-blue-100 text-sm">
                      {t("exercises.teacher")}
                    </p>
                    <p className="text-white font-semibold">
                      {selectedExercise.creator?.name ||
                        t("exercisePublicView.defaultTeacher")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {/* Exercise Note */}
            {selectedExercise.note && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-amber-100 rounded-xl mr-4">
                    <BookOpen className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t("exercisePublicView.note")}
                  </h3>
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-4 md:p-6">
                  <p className="text-amber-800 text-lg leading-relaxed">
                    {selectedExercise.note}
                  </p>
                </div>
              </div>
            )}

            {/* Exercise Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
              {/* Content Header with Controls */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t("exercisePublicView.content")}
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
                      {t("exercisePublicView.readingMode")}
                    </button>
                    <button
                      onClick={() => setPreviewMode("content")}
                      className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                        previewMode === "content"
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {t("exercisePublicView.richText")}
                    </button>
                    {selectedExercise.latexContent && (
                      <button
                        onClick={() => setPreviewMode("latex")}
                        className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                          previewMode === "latex"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {t("exercisePublicView.latex")}
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
                    <div className="reading-mode-content bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-8 border border-blue-100">
                      <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm">
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
                                '<pre class="bg-gray-100 p-8 rounded-lg mb-4 overflow-x-auto"'
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
                      <p>{t("exercisePublicView.noContent")}</p>
                    </div>
                  )}
              </div>
            </div>

            {/* Action Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex flex-col gap-2 text-start">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {isTeacher ? "" : t("exercises.readyToSubmit")}
                    </h4>
                    <p className="text-gray-600">
                      {isTeacher ? "" : t("exercises.completeAndSubmit")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {!isTeacher && (
                    <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold">
                      {t("exercises.submitExercise")}
                    </button>
                  )}
                  {isTeacher && (
                    <div className="flex space-x-4">
                      <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        {t("exercises.viewSubmissions")}
                      </button>
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold">
                        {t("exercises.gradeExercise")}
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
    <div className="p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 h-full w-1 bg-white/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {isTeacher
                  ? t("exercises.teacher_title")
                  : t("exercises.student_title")}
              </h1>
            </div>

            {/* Decorative Rubik's Cube-like Element */}
            <div className="hidden md:block relative">
              <div className="relative">
                {/* Main cube structure */}
                <div className="grid grid-cols-3 gap-1 transform rotate-12">
                  {/* Top row */}
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>
                  <div className="w-6 h-6 bg-orange-400 rounded-sm"></div>
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>

                  {/* Middle row */}
                  <div className="w-6 h-6 bg-yellow-400 rounded-sm"></div>
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                  <div className="w-6 h-6 bg-blue-400 rounded-sm"></div>

                  {/* Bottom row */}
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>
                  <div className="w-6 h-6 bg-green-400 rounded-sm"></div>
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>
                </div>

                {/* Side face of cube */}
                <div className="absolute top-1 left-1 grid grid-cols-3 gap-1 transform translate-x-6 -translate-y-6 rotate-12 opacity-60">
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                </div>

                {/* Additional decorative elements */}
                <div className="absolute -top-4 -right-4 w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-white/20 rounded-full"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-3 md:gap-6 mb-8">
          <div className="relative overflow-hidden bg-white px-3 py-3 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0">
            <div className="absolute top-0 left-0 h-1 w-full bg-purple-500"></div>
            <div className="w-8 md:w-10 flex-shrink-0 flex items-center justify-center">
              <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center ml-2 md:ml-0">
              <p className="text-lg md:text-xl font-semibold text-gray-900">
                {exercises.length}
              </p>
              <p className="text-sm md:text-base font-medium text-gray-600 text-center">
                {t("exercises.total")}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white px-3 py-3 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0">
            <div className="absolute top-0 left-0 h-1 w-full bg-green-500"></div>
            <div className="w-8 md:w-10 flex-shrink-0 flex items-center justify-center">
              <div className="p-1.5 md:p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center ml-2 md:ml-0">
              <p className="text-lg md:text-xl font-semibold text-gray-900">
                {
                  exercises.filter((ex: Exercise) => ex.status === "ACTIVE")
                    .length
                }
              </p>
              <p className="text-sm md:text-base font-medium text-gray-600 text-center">
                {t("status.active")}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white px-3 py-3 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0">
            <div className="absolute top-0 left-0 h-1 w-full bg-red-500"></div>
            <div className="w-8 md:w-10 flex-shrink-0 flex items-center justify-center">
              <div className="p-1.5 md:p-2 bg-red-100 rounded-lg">
                <CalendarClock className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center ml-2 md:ml-0">
              <p className="text-lg md:text-xl font-semibold text-gray-900">
                {
                  exercises.filter(
                    (ex: Exercise) =>
                      ex.status === "ACTIVE" &&
                      new Date(ex.deadline) < new Date() &&
                      new Date(ex.deadline) > new Date()
                  ).length
                }
              </p>
              <p className="text-sm md:text-base font-medium text-gray-600 text-center">
                {t("exercises.overdue")}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white px-3 py-3 md:px-5 md:py-2 rounded-lg shadow-sm border border-gray-200 flex items-center w-full sm:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 lg:min-w-0">
            <div className="absolute top-0 left-0 h-1 w-full bg-orange-500"></div>
            <div className="w-8 md:w-10 flex-shrink-0 flex items-center justify-center">
              <div className="p-1.5 md:p-2 bg-orange-100 rounded-lg">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center ml-2 md:ml-0">
              <p className="text-lg md:text-xl font-semibold text-gray-900">
                7
              </p>
              <p className="text-sm md:text-base font-medium text-gray-600 text-center">
                {t("exercises.completed")}
              </p>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {exercises.map((exercise: Exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
              >
                <div className="p-2 bg-blue-100 rounded-bl-lg absolute top-0 right-0 rounded-tr-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex-col mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-start mr-2 h-14">
                      {exercise.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-start h-10 ">
                      {exercise.description}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                      <Badge variant="subject">
                        {t(`subject.${exercise.subject.toLowerCase()}`)}
                      </Badge>
                      <Badge variant="grade">
                        {t("exercises.class")} {exercise.grade}
                      </Badge>
                      <Badge
                        variant="status"
                        className={`${
                          exercise.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : exercise.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {exercise.status === "ACTIVE"
                          ? t("status.active")
                          : exercise.status === "DRAFT"
                          ? t("status.draft")
                          : t("status.closed")}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {t("exercises.createdAt")}:{" "}
                        {new Date(exercise.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      <span>
                        {t("exercises.deadline")}:{" "}
                        {new Date(exercise.deadline).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <BookCheck className="h-4 w-4 mr-1" />
                      <span>
                        {exercise.submissions || 0} {t("exercises.submissions")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 text-start flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>
                        {exercise.creator?.name ||
                          t("exercisePublicView.defaultTeacher")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewExercise(exercise)}
                  className="w-full flex items-center text-sm justify-center px-4 py-2 bg-blue-700 text-white font-bold rounded-md hover:bg-purple-700 transition-colors"
                >
                  {" "}
                  {isTeacher
                    ? t("exercises.viewDetails")
                    : t("exercises.viewAndDo")}
                </button>
              </div>
            ))}
          </div>
        )}

        {exercises.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("exercisePublicView.noExercises")}
            </h3>
            <p className="text-gray-600">
              {t("exercisePublicView.noExercisesDescription")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
