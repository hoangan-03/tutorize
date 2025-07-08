import React, { useState } from "react";
import {
  Upload,
  FileIcon,
  X,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Exercise, ExerciseSubmission } from "../../types/api";
import { exerciseService } from "../../services/exerciseService";

interface StudentSubmissionFormProps {
  exercise: Exercise;
  existingSubmission?: ExerciseSubmission;
  onSubmissionSuccess: (submission: ExerciseSubmission) => void;
  onClose: () => void;
}

export const StudentSubmissionForm: React.FC<StudentSubmissionFormProps> = ({
  exercise,
  existingSubmission,
  onSubmissionSuccess,
  onClose,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(existingSubmission?.content || "");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📽️";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "zip":
      case "rar":
        return "🗜️";
      default:
        return "📎";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      alert(t("studentSubmissionForm.validationMessage"));
      return;
    }

    try {
      setUploading(true);

      // Submit with content and files
      const submission = await exerciseService.submitExercise(
        exercise.id!,
        content,
        files
      );

      onSubmissionSuccess(submission);
    } catch (error) {
      console.error("Error submitting exercise:", error);
      alert(t("studentSubmissionForm.errorSubmitting"));
    } finally {
      setUploading(false);
    }
  };

  const isOverdue = new Date() > new Date(exercise.deadline);
  const canSubmit = exercise.allowLateSubmission || !isOverdue;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{exercise.name}</h2>
              <p className="text-blue-100 mt-1">
                {t("studentSubmissionForm.deadline")}:{" "}
                {new Date(exercise.deadline).toLocaleDateString("vi-VN")}
                {isOverdue && (
                  <span className="ml-2 bg-red-500 px-2 py-1 rounded text-xs">
                    {t("studentSubmissionForm.overdue")}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={t("studentSubmissionForm.close")}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!canSubmit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-700">
                {t("studentSubmissionForm.overdueAndNoLateSubmission")}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("studentSubmissionForm.submissionContent")}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("studentSubmissionForm.submissionPlaceholder")}
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={!canSubmit}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("studentSubmissionForm.attachFiles")}
              </label>

              {canSubmit && (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {t("studentSubmissionForm.dragAndDrop")}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {t("studentSubmissionForm.or")}
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    <FileIcon className="h-5 w-5 mr-2" />
                    {t("studentSubmissionForm.selectFiles")}
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    {t("studentSubmissionForm.allFileTypesSupported")}
                  </p>
                </div>
              )}

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {t("studentSubmissionForm.selectedFiles", {
                      count: files.length,
                    })}
                  </h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getFileIcon(file.name)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      {canSubmit && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title={t("studentSubmissionForm.removeFile")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {existingSubmission ? (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    Đã nộp lúc{" "}
                    {new Date(existingSubmission.submittedAt).toLocaleString(
                      "vi-VN"
                    )}
                  </span>
                ) : (
                  "Chưa nộp bài"
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || uploading}
                  className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                    canSubmit && !uploading
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang nộp...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {existingSubmission ? "Cập nhật bài nộp" : "Nộp bài"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
