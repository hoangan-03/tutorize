import React, { useState, useRef, useCallback, useEffect } from "react";
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
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Star,
  MessageSquare,
} from "lucide-react";
import { useExercise, useModal } from "../hooks";
import {
  ExerciseStatus,
  Exercise,
  ExerciseSubmission,
  SubmissionStatus,
} from "../types/api";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { PDFViewer, ActionButton, Badge } from "../components/ui";
import { exerciseService } from "../services/exerciseService";
import { uploadService } from "../services/uploadService";

import "katex/dist/katex.min.css";
import {
  formatDate,
  formatDateTime,
  generateExercisePDF,
  validateFiles,
  IMAGE_TYPES,
} from "../components/utils";
import { FontList } from "../components/constant";

export const ExerciseDetailView: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError, showConfirm } = useModal();
  const { exercise, isLoading } = useExercise(
    exerciseId ? parseInt(exerciseId) : null
  );
  const [selectedFont, setSelectedFont] = useState<string>(FontList[0].name);
  const contentRef = useRef<HTMLDivElement>(null);

  enum UploadStatus {
    PENDING = "pending",
    UPLOADING = "uploading",
    SUCCESS = "success",
    ERROR = "error",
  }
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      file: File;
      preview: string;
      uploadStatus: UploadStatus;
      driveLink?: string;
      error?: string;
    }>
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student submission states
  const [existingSubmission, setExistingSubmission] =
    useState<ExerciseSubmission | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);

  // Load existing submission for students
  const loadExistingSubmission = useCallback(async () => {
    try {
      const submissions = await exerciseService.getMySubmissions({
        page: 1,
        limit: 100,
      });
      const submission = submissions.data.find(
        (s) => s.exercise?.id === exercise?.id
      );

      if (submission) {
        setExistingSubmission(submission);

        // Parse existing images
        if (submission.submissionUrl) {
          try {
            const imageUrls = JSON.parse(
              submission.submissionUrl as unknown as string
            );
            setExistingImages(Array.isArray(imageUrls) ? imageUrls : []);
          } catch {
            setExistingImages([]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading existing submission:", error);
    }
  }, [exercise?.id]);

  useEffect(() => {
    if (!isTeacher && exercise?.id) {
      loadExistingSubmission();
    }
  }, [isTeacher, exercise?.id, loadExistingSubmission]);

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle submission update
  const handleUpdateSubmission = async () => {
    if (!existingSubmission) return;

    try {
      setIsSubmitting(true);

      // Upload new images
      const uploadPromises = uploadedImages.map(async (imageData) => {
        if (imageData.uploadStatus === "pending") {
          return await uploadService.uploadFile(imageData.file, exercise?.id);
        }
        return imageData.driveLink;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      const allImageUrls = [
        ...existingImages,
        ...newImageUrls.filter((url): url is string => Boolean(url)),
      ];

      await exerciseService.updateSubmission(
        existingSubmission.id,
        allImageUrls
      );
      setEditing(false);
      setUploadedImages([]);
      loadExistingSubmission();

      showSuccess(t("exercises.submissionUpdated"), {
        title: t("common.success"),
        autoClose: true,
        autoCloseDelay: 2000,
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      showError(t("exercises.submissionError"), t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submission deletion
  const handleDeleteSubmission = async () => {
    if (!existingSubmission) return;

    showConfirm(
      t("exercises.confirmDeleteMessage"),
      async () => {
        try {
          await exerciseService.deleteSubmission(existingSubmission.id);
          setExistingSubmission(null);
          setExistingImages([]);
          showSuccess(t("exercises.submissionDeleted"), {
            title: t("common.success"),
            autoClose: true,
            autoCloseDelay: 2000,
          });
        } catch (error) {
          console.error("Error deleting submission:", error);
          showError(t("exercises.submissionError"), t("common.error"));
        }
      },
      {
        title: t("exercises.confirmDelete"),
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
      }
    );
  };

  const handleFileSelect = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      const { validFiles, invalidFiles } = validateFiles(
        fileArray,
        IMAGE_TYPES
      );

      if (invalidFiles.length > 0) {
        const errorMessages = invalidFiles
          .map(({ file, errorMessage }) => `${file.name}: ${errorMessage}`)
          .join("\n");

        showError(
          `${t("common.someFilesIsNotValid")}\n${errorMessages}`,
          `${t("common.invalidFiles")}`
        );
      }

      if (validFiles.length === 0) {
        return;
      }

      const newImages = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploadStatus: UploadStatus.PENDING,
      }));

      setUploadedImages((prev) => [...prev, ...newImages]);
    },
    [UploadStatus.PENDING, showError, t]
  );

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
      prev.map((img) => ({ ...img, uploadStatus: UploadStatus.UPLOADING }))
    );

    const uploadPromises = uploadedImages.map(async (imageData, index) => {
      try {
        const uploadUrl = await uploadService.uploadFile(
          imageData.file,
          exercise?.id
        );
        setUploadedImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            ...newImages[index],
            uploadStatus: UploadStatus.SUCCESS,
            driveLink: uploadUrl,
          };
          return newImages;
        });
        return uploadUrl;
      } catch (error) {
        setUploadedImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            ...newImages[index],
            uploadStatus: UploadStatus.ERROR,
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
    if (existingSubmission && editing) {
      // Update existing submission
      await handleUpdateSubmission();
      return;
    }

    if (uploadedImages.length === 0) {
      showError(t("exercises.pleaseUploadImages"), t("common.error"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all images to Cloudinary first
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

      showSuccess(t("exercises.submissionSuccess"), {
        title: t("common.success"),
        autoClose: true,
        autoCloseDelay: 2000,
      });

      // Clear uploaded images and reload submission
      uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);
      loadExistingSubmission();
    } catch (error) {
      console.error("Submission error:", error);
      showError(t("exercises.submissionError"), t("common.error") || "Lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadAsPDF = async (exerciseData: Exercise) => {
    if (!exerciseData) return;

    try {
      await generateExercisePDF(exerciseData, {
        selectedFont,
        showHeader: false,
      });
    } catch (error) {
      console.error("PDF Error:", error);
      showError(t("exercisePublicView.printFallback"));
    }
  };

  const handleBackToList = () => {
    navigate("/exercises");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="mx-auto p-2 lg:p-6 lg:px-16 xl:px-20">
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
        <div className="mx-auto p-2 lg:p-6 lg:px-16 xl:px-20">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("exercisePublicView.notFound")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("exercisePublicView.notFoundDescription")}
            </p>
            <ActionButton
              onClick={handleBackToList}
              colorTheme="blue"
              hasIcon={false}
              text={t("common.back")}
              size="md"
              className="px-6 py-2"
            />
          </div>
        </div>
      </div>
    );
  }

  const exerciseTitle = exercise.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="mx-auto p-6 lg:px-16 xl:px-20">
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
            <div className="hidden md:flex flex-col space-y-3 ">
              <ActionButton
                onClick={() => downloadAsPDF(exercise)}
                colorTheme="white"
                textColor="text-white"
                hasIcon={true}
                icon={Download}
                text={t("exercises.downloadPDF")}
                className="border border-white/20 backdrop-blur-sm"
                size="md"
              />
              <ActionButton
                onClick={handleBackToList}
                colorTheme="transparent"
                textColor="text-white"
                hasIcon={true}
                icon={ArrowLeft}
                text={t("common.back")}
                className="border border-white/20 backdrop-blur-sm w-full items-start"
                size="md"
              />
            </div>
          </div>

          {/* Action Buttons Row - Shown on small screens only */}
          <div className="flex md:hidden flex-row gap-3">
            <ActionButton
              onClick={() => downloadAsPDF(exercise)}
              colorTheme="white"
              textColor="text-white"
              hasIcon={true}
              icon={Download}
              text={t("exercises.downloadPDF")}
              className="flex-1 justify-center border border-white/20 backdrop-blur-sm"
              size="md"
            />
            <ActionButton
              onClick={handleBackToList}
              colorTheme="transparent"
              textColor="text-white"
              hasIcon={true}
              icon={ArrowLeft}
              text={t("common.back")}
              className="flex-1 justify-center border border-white/20 backdrop-blur-sm"
              size="md"
            />
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
                {/* Font Selector - Only in reading mode */}

                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4 text-gray-500" />
                  <select
                    aria-label="Chọn font"
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {FontList.map((font) => (
                      <option key={font.name} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Display */}
            <div ref={contentRef}>
              {exercise.fileUrl ? (
                /* PDF File Display */
                <PDFViewer
                  fileUrl={exercise.fileUrl}
                  fileName={exercise.fileName}
                  exerciseId={exercise.id}
                />
              ) : exercise.content ? (
                /* Text Content Display */
                <div className="max-w-none">
                  <div className="reading-mode-content bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-8 border border-blue-100">
                    <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm">
                      <style>
                        {`
                          .font-override-container * {
                            font-family: ${selectedFont} !important;
                          }
                          .font-override-container code,
                          .font-override-container pre {
                            font-family: 'Courier New', Consolas, monospace !important;
                          }
                        `}
                      </style>
                      <div
                        className="prose prose-lg max-w-none text-start prose-headings:text-gray-800 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 content-text text-lg leading-loose font-override-container"
                        style={{
                          fontFamily: `${selectedFont} !important`,
                          lineHeight: "1.8",
                          fontSize: "18px",
                          color: "#374151",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: exercise.content
                            .replace(
                              /<h1/g,
                              `<h1 style="font-family: ${selectedFont} !important;" class="text-base md:text-xl lg:text-3xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-4"`
                            )
                            .replace(
                              /<h2/g,
                              `<h2 style="font-family: ${selectedFont} !important;" class="text-2xl font-semibold mb-4 mt-8 text-gray-800"`
                            )
                            .replace(
                              /<h3/g,
                              `<h3 style="font-family: ${selectedFont} !important;" class="text-xl font-medium mb-3 mt-6 text-gray-800"`
                            )
                            .replace(
                              /<p/g,
                              `<p style="font-family: ${selectedFont} !important;" class="mb-4 text-gray-700 leading-relaxed"`
                            )
                            .replace(
                              /<ul/g,
                              `<ul style="font-family: ${selectedFont} !important;" class="mb-4 pl-6 space-y-2"`
                            )
                            .replace(
                              /<ol/g,
                              `<ol style="font-family: ${selectedFont} !important;" class="mb-4 pl-6 space-y-2"`
                            )
                            .replace(
                              /<li/g,
                              `<li style="font-family: ${selectedFont} !important;" class="text-gray-700"`
                            )
                            .replace(
                              /<strong/g,
                              `<strong style="font-family: ${selectedFont} !important;" class="font-semibold text-gray-900"`
                            )
                            .replace(
                              /<em/g,
                              `<em style="font-family: ${selectedFont} !important;" class="italic text-gray-800"`
                            )
                            .replace(
                              /<blockquote/g,
                              `<blockquote style="font-family: ${selectedFont} !important;" class="border-l-4 border-blue-300 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700"`
                            )
                            .replace(
                              /<code/g,
                              '<code class="bg-gray-100 px-2 py-1 rounded-lg text-sm font-mono text-gray-800"'
                            )
                            .replace(
                              /<pre/g,
                              '<pre class="bg-gray-100 p-8  mb-4 overflow-x-auto"'
                            ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* No Content */
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("exercisePublicView.noContent")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Student Submission View Section - Show existing submission */}
          {!isTeacher && existingSubmission && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col text-start min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {t("exercises.yourSubmission")}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base break-all">
                      {t("exercises.submittedOn")}{" "}
                      {formatDateTime(existingSubmission.submittedAt)}
                    </p>
                  </div>
                </div>

                {/* Status Badge and Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
                  {/* Status Badge */}
                  <div className="w-full sm:w-auto">
                    {existingSubmission.status ===
                      SubmissionStatus.SUBMITTED && (
                      <Badge
                        variant="status"
                        className="bg-blue-100 text-blue-800 w-full sm:w-auto justify-center sm:justify-start"
                      >
                        {t("exercises.waitingForGrade")}
                      </Badge>
                    )}
                    {existingSubmission.status === SubmissionStatus.GRADED && (
                      <Badge
                        variant="status"
                        className="bg-green-100 text-green-800 w-full sm:w-auto justify-center sm:justify-start"
                      >
                        {t("exercises.graded")}
                      </Badge>
                    )}
                  </div>

                  {/* Edit/Delete buttons only if not graded */}
                  {existingSubmission.status === SubmissionStatus.SUBMITTED && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <ActionButton
                        onClick={() => setEditing(!editing)}
                        colorTheme="blue"
                        hasIcon={true}
                        icon={Edit}
                        text={editing ? t("common.cancel") : t("common.edit")}
                      />
                      <ActionButton
                        onClick={handleDeleteSubmission}
                        colorTheme="red"
                        hasIcon={true}
                        icon={Trash2}
                        text={t("common.delete")}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Score and Feedback */}
              {existingSubmission.score !== null && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 ">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <h4 className="font-semibold text-green-800 text-sm sm:text-base">
                      {t("exercises.gradeResult")}
                    </h4>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
                    {existingSubmission.score}/10 {t("exercises.points")}
                  </div>
                  {existingSubmission.feedback && (
                    <div>
                      <h5 className="font-medium text-green-800 mb-1 flex items-center gap-1 text-sm sm:text-base">
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        {t("exercises.feedback")}:
                      </h5>
                      <p className="text-green-700 text-sm sm:text-base leading-relaxed break-words">
                        {existingSubmission.feedback}
                      </p>
                    </div>
                  )}
                  {existingSubmission.gradedAt && (
                    <div className="text-xs sm:text-sm text-green-600 mt-2 break-all">
                      {t("exercises.gradedOn")}{" "}
                      {formatDateTime(existingSubmission.gradedAt)}
                    </div>
                  )}
                </div>
              )}

              {/* Existing Images */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">
                  {t("exercises.submittedImages")} ({existingImages.length})
                </h4>

                {existingImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`${t("exercises.submission")} ${index + 1}`}
                          className="w-full h-40 sm:h-48 object-cover rounded-lg border cursor-pointer"
                          onClick={() => window.open(imageUrl, "_blank")}
                        />
                        {editing && (
                          <ActionButton
                            onClick={() => removeExistingImage(index)}
                            colorTheme="red"
                            hasIcon={true}
                            icon={X}
                            iconOnly={true}
                            title={t("exercises.removeImage")}
                            className="absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            size="sm"
                          />
                        )}
                        <div className="absolute bottom-2 left-2">
                          <Badge
                            variant="status"
                            className="bg-gray-100 text-gray-800 text-xs"
                          >
                            {t("exercises.image")} {index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">
                      {t("exercises.noImages")}
                    </p>
                  </div>
                )}

                {/* Save/Cancel buttons when editing */}
                {editing && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-200">
                    <ActionButton
                      onClick={handleUpdateSubmission}
                      disabled={isSubmitting}
                      colorTheme="green"
                      hasIcon={false}
                      text={
                        isSubmitting
                          ? t("exercises.saving")
                          : t("exercises.saveChanges")
                      }
                      className="w-full sm:w-auto"
                      size="md"
                    />
                    <ActionButton
                      onClick={() => {
                        setEditing(false);
                        setUploadedImages([]);
                      }}
                      colorTheme="gray"
                      hasIcon={false}
                      text={t("common.cancel")}
                      className="w-full sm:w-auto"
                      size="md"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Upload Section - Only for active exercises and non-teachers */}
          {!isTeacher &&
            exercise.status === ExerciseStatus.ACTIVE &&
            (!existingSubmission || editing) && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                  <div className="flex items-center flex-1">
                    <div className="p-3 bg-green-100 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                      <Upload className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {existingSubmission && editing
                        ? t("exercises.editSubmission")
                        : t("exercises.submitYourWork")}
                    </h3>
                  </div>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center transition-colors ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {t("exercises.uploadImages")}
                  </h4>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base px-2">
                    {t("exercises.dragDropOrClick")}
                  </p>
                  <ActionButton
                    onClick={() => fileInputRef.current?.click()}
                    colorTheme="blue"
                    hasIcon={false}
                    text={t("exercises.selectFiles")}
                    size="md"
                  />
                  <input
                    aria-label="Chọn file"
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
                  <div className="mt-4 sm:mt-6">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                      {t("exercises.uploadedImages")} ({uploadedImages.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                      {uploadedImages.map((imageData, index) => (
                        <div
                          key={index}
                          className="relative bg-gray-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={imageData.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover"
                          />

                          {/* Upload Status Overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            {imageData.uploadStatus === "success" && (
                              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                            )}
                            {imageData.uploadStatus === "error" && (
                              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
                            )}
                          </div>

                          {/* Remove Button */}
                          <ActionButton
                            onClick={() => removeImage(index)}
                            colorTheme="red"
                            hasIcon={true}
                            icon={X}
                            iconOnly={true}
                            title={t("exercises.removeImage")}
                            className="absolute top-1 right-1 sm:top-2 sm:right-2 rounded-full"
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4 sm:mt-6 flex justify-center">
                      <ActionButton
                        onClick={submitExercise}
                        disabled={
                          isSubmitting ||
                          uploadedImages.some(
                            (img) => img.uploadStatus === "uploading"
                          )
                        }
                        colorTheme={
                          isSubmitting ||
                          uploadedImages.some(
                            (img) => img.uploadStatus === "uploading"
                          )
                            ? "gray"
                            : "gradient"
                        }
                        textColor={
                          isSubmitting ||
                          uploadedImages.some(
                            (img) => img.uploadStatus === "uploading"
                          )
                            ? "text-gray-700"
                            : "text-white"
                        }
                        hasIcon={false}
                        text={
                          isSubmitting ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                              {existingSubmission && editing
                                ? t("exercises.updating")
                                : t("exercises.submitting")}
                            </div>
                          ) : existingSubmission && editing ? (
                            t("exercises.updateSubmission")
                          ) : (
                            t("exercises.submitExercise")
                          )
                        }
                        className="w-full sm:w-auto shadow-lg hover:shadow-xl"
                        size="lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
