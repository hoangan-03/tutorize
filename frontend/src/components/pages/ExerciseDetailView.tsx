import React, { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Download,
  FileText,
  Clock,
  Type,
  BookCheck,
  Users,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { InlineMath } from "react-katex";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useExercise } from "../../hooks";
import { ExerciseStatus, Exercise } from "../../types/api";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import { exerciseService } from "../../services/exerciseService";
import { GoogleDriveService } from "../../services/googleDriveService";

import "katex/dist/katex.min.css";
import { formatDate } from "../utils";

export const ExerciseDetailView: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  const { t } = useTranslation();
  const { exercise, isLoading } = useExercise(
    exerciseId ? parseInt(exerciseId) : null
  );
  const [previewMode, setPreviewMode] = useState<
    "content" | "latex" | "reading"
  >("reading");
  const [selectedFont, setSelectedFont] = useState<string>("Cambria Math");
  const contentRef = useRef<HTMLDivElement>(null);

  // Image upload states
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      file: File;
      preview: string;
      uploadStatus: "pending" | "uploading" | "success" | "error";
      driveLink?: string;
      error?: string;
    }>
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploadStatus: "pending" as const,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Remove image from upload list
  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  // Upload all images to Google Drive
  const uploadAllImages = async () => {
    setUploadedImages((prev) =>
      prev.map((img) => ({ ...img, uploadStatus: "uploading" as const }))
    );

    const uploadPromises = uploadedImages.map(async (imageData, index) => {
      try {
        const driveLink = await GoogleDriveService.uploadFile(
          imageData.file,
          exercise?.id
        );
        setUploadedImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            ...newImages[index],
            uploadStatus: "success",
            driveLink,
          };
          return newImages;
        });
        return driveLink;
      } catch (error) {
        setUploadedImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            ...newImages[index],
            uploadStatus: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          };
          return newImages;
        });
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Submit exercise with uploaded images
  const submitExercise = async () => {
    if (uploadedImages.length === 0) {
      alert(t("exercises.pleaseUploadImages"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all images to Google Drive first
      const driveLinks = await uploadAllImages();

      // Filter out any failed uploads
      const successfulLinks = driveLinks.filter((link: string | null) => link);

      if (successfulLinks.length === 0) {
        throw new Error("No images were uploaded successfully");
      }

      // Submit to backend using exerciseService
      await exerciseService.submitExerciseWithImages(
        exercise!.id,
        successfulLinks
      );

      alert(t("exercises.submissionSuccess"));

      // Clear uploaded images
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);
    } catch (error) {
      console.error("Submission error:", error);
      alert(t("exercises.submissionError"));
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const downloadAsPDF = async (exerciseData: Exercise) => {
    if (!exerciseData) return;

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
      const exerciseContent = exerciseData.content || "";

      // Create PDF content with safe hex colors (no oklch)
      const cleanContent = exerciseContent
        .replace(/class="[^"]*"/g, "") // Remove all CSS classes
        .replace(/style="[^"]*"/g, "") // Remove existing styles
        .replace(/<([^>]+)>/g, (_match: string, content: string) => {
          // Clean up any problematic attributes
          return `<${content
            .replace(/class="[^"]*"/g, "")
            .replace(/style="[^"]*"/g, "")}>`;
        });

      const exerciseTitle = (
        exerciseData.name || t("exercisePublicView.defaultTitle")
      ).toString();
      const exerciseSubject = (
        exerciseData.subject || t("exercisePublicView.defaultSubject")
      ).toString();
      const exerciseGrade = (
        exerciseData.grade || t("exercisePublicView.defaultGrade")
      ).toString();
      const exerciseDeadline =
        exerciseData.deadline ||
        exerciseData.createdAt ||
        new Date().toISOString();
      const exerciseTeacher = (
        exerciseData.creator?.profile?.firstName ||
        t("exercisePublicView.defaultTeacher")
      ).toString();
      const exerciseNote = (exerciseData.note || "").toString();

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
          exerciseData.name || t("exercisePublicView.defaultTitle")
        ).toString();
        const fallbackSubject = (
          exerciseData.subject || t("exercisePublicView.defaultSubject")
        ).toString();
        const fallbackGrade = (
          exerciseData.grade || t("exercisePublicView.defaultGrade")
        ).toString();
        const fallbackTeacher = (
          exerciseData.creator?.profile?.firstName ||
          t("exercisePublicView.defaultTeacher")
        ).toString();
        const fallbackDeadline =
          exerciseData.deadline ||
          exerciseData.createdAt ||
          new Date().toISOString();
        const fallbackContent =
          exerciseData.content || t("exercisePublicView.noContent");

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

  const handleBackToList = () => {
    navigate("/exercises");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("exercisePublicView.notFound")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("exercisePublicView.notFoundDescription")}
            </p>
            <button
              onClick={handleBackToList}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t("common.back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exerciseTitle = exercise.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-sky-700 to-sky-900 rounded-2xl shadow-xl text-white p-4 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-base md:text-xl lg:text-3xl font-bold">
                    {exerciseTitle}
                  </h1>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center space-x-3 mb-6">
                <Badge
                  variant="subject"
                  className="bg-white/20 text-white text-xs md:text-sm rounded-full backdrop-blur-sm border-0"
                >
                  {t(`subjects.${exercise.subject.toLowerCase()}`)}
                </Badge>
                <Badge
                  variant="grade"
                  className="bg-white/20 text-white text-xs md:text-sm rounded-full backdrop-blur-sm border-0"
                >
                  {t("exercises.class")} {exercise.grade}
                </Badge>
                {exercise.status === ExerciseStatus.ACTIVE && (
                  <span className="px-3 py-1 bg-green-700/30 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
                    {t("exercises.active")}
                  </span>
                )}
                {exercise.status === ExerciseStatus.INACTIVE && (
                  <span className="px-3 py-1 bg-red-700/30 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
                    {t("exercises.inactive")}
                  </span>
                )}
                {exercise.status === ExerciseStatus.DRAFT && (
                  <span className="px-3 py-1 bg-yellow-700/30 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
                    {t("exercises.draft")}
                  </span>
                )}
                {exercise.status === ExerciseStatus.OVERDUE && (
                  <span className="px-3 py-1 bg-gray-700/30 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
                    {t("exercises.overdue")}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons - Hidden on small screens, shown on md+ in column */}
            <div className="hidden md:flex flex-col space-y-3">
              <button
                onClick={() => downloadAsPDF(exercise)}
                className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <Download className="h-5 w-5 mr-2" />
                {t("exercises.downloadPDF")}
              </button>
              <button
                onClick={handleBackToList}
                className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t("common.back")}
              </button>
            </div>
          </div>

          {/* Action Buttons Row - Shown on small screens only */}
          <div className="flex md:hidden flex-row gap-3">
            <button
              onClick={() => downloadAsPDF(exercise)}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <Download className="h-5 w-5 mr-2" />
              {t("exercises.downloadPDF")}
            </button>
            <button
              onClick={handleBackToList}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("common.back")}
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-white mr-3" />
                <div className="flex flex-col text-start">
                  <p className="text-blue-100 text-sm">
                    {t("exercises.deadline")}
                  </p>
                  <p className="text-white font-semibold">
                    {formatDate(exercise.deadline)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
              <div className="flex items-center">
                <BookCheck className="h-6 w-6 text-white mr-3" />
                <div className="flex flex-col text-start">
                  <p className="text-blue-100 text-sm">
                    {t("exercises.maxScore")}
                  </p>
                  <p className="text-white font-semibold">
                    {exercise.maxScore || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-white mr-3" />
                <div className="flex flex-col text-start">
                  <p className="text-blue-100 text-sm">
                    {t("exercises.createdAt")}
                  </p>
                  <p className="text-white font-semibold">
                    {formatDate(exercise.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/15 rounded-xl p-4 md:p-8 backdrop-blur-sm border border-white/20">
              <div className="flex items-center">
                <GraduationCap className="h-6 w-6 text-white mr-3" />
                <div className="flex flex-col text-start">
                  <p className="text-blue-100 text-sm">
                    {t("exercises.teacher")}
                  </p>
                  <p className="text-white font-semibold">
                    {exercise.creator?.profile?.firstName ||
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
          {exercise.note && (
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
                  {exercise.note}
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
                    <BookOpen className="h-4 w-4 mr-2" />
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
                  {exercise.latexContent && (
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
                        className="prose prose-lg max-w-none text-start prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 content-text text-lg leading-loose"
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
                            .replace(/<ul/g, '<ul class="mb-4 pl-6 space-y-2"')
                            .replace(/<ol/g, '<ol class="mb-4 pl-6 space-y-2"')
                            .replace(/<li/g, '<li class="text-gray-700"')
                            .replace(
                              /<strong/g,
                              '<strong class="font-semibold text-gray-900"'
                            )
                            .replace(/<em/g, '<em class="italic text-gray-800"')
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
                  className="prose prose-lg max-w-none text-start"
                  dangerouslySetInnerHTML={{
                    __html: exercise.content,
                  }}
                />
              ) : (
                <div className="prose prose-lg max-w-none text-start">
                  <div className="space-y-4">
                    {exercise.latexContent &&
                      exercise.latexContent.split("\n").map((line, i) => {
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
                  <p>{t("exercisePublicView.noContent")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Section - Only for active exercises and non-teachers */}
          {!isTeacher && exercise.status === ExerciseStatus.ACTIVE && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("exercises.submitYourWork")}
                </h3>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("exercises.uploadImages")}
                </h4>
                <p className="text-gray-600 mb-4">
                  {t("exercises.dragDropOrClick")}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("exercises.selectFiles")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleFileSelect(e.target.files)
                  }
                />
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("exercises.uploadedImages")} ({uploadedImages.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((imageData, index) => (
                      <div
                        key={index}
                        className="relative bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={imageData.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />

                        {/* Upload Status Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          {imageData.uploadStatus === "pending" && (
                            <span className="text-white text-sm">
                              {t("exercises.pending")}
                            </span>
                          )}
                          {imageData.uploadStatus === "uploading" && (
                            <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                              <span className="text-xs">
                                {t("exercises.uploading")}
                              </span>
                            </div>
                          )}
                          {imageData.uploadStatus === "success" && (
                            <CheckCircle className="h-8 w-8 text-green-400" />
                          )}
                          {imageData.uploadStatus === "error" && (
                            <AlertCircle className="h-8 w-8 text-red-400" />
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeImage(index)}
                          aria-label={t("exercises.removeImage")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={submitExercise}
                      disabled={
                        isSubmitting ||
                        uploadedImages.some(
                          (img) => img.uploadStatus === "uploading"
                        )
                      }
                      className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                        isSubmitting ||
                        uploadedImages.some(
                          (img) => img.uploadStatus === "uploading"
                        )
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {t("exercises.submitting")}
                        </div>
                      ) : (
                        t("exercises.submitExercise")
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex flex-col gap-2 text-start">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {isTeacher
                      ? ""
                      : exercise.status === ExerciseStatus.ACTIVE
                      ? t("exercises.readyToSubmit")
                      : t("exercises.unavailable")}
                  </h4>
                  <p className="text-gray-600">
                    {isTeacher
                      ? ""
                      : exercise.status === ExerciseStatus.ACTIVE
                      ? t("exercises.completeAndSubmit")
                      : t("exercises.contactAdministrator")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!isTeacher && (
                  <button
                    className={`${
                      exercise.status === ExerciseStatus.ACTIVE
                        ? "block"
                        : "hidden"
                    } px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold`}
                  >
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
};
