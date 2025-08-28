import React, { useState } from "react";
import {
  Play,
  Pause,
  Plus,
  Save,
  ArrowLeft,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { RichTextEditor } from "../components/ui/RichTextEditor";
import { Exercise, ExerciseStatus, Subject } from "../types/api";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../components/ui";
import { exerciseService } from "../services/exerciseService";
import { PDF_TYPES, validateFiles } from "../components/utils";
import { useModal } from "../hooks";

interface ExerciseFormProps {
  formData: Exercise;
  onInputChange: (field: string, value: unknown) => void;
  onToggleStatus: () => void;
  onSave?: (selectedFile?: File) => void;
  onCancel: () => void;
  isEdit: boolean;
  onExerciseUpdate?: (exercise: Exercise) => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  formData,
  onInputChange,
  onToggleStatus,
  onSave,
  onCancel,
  isEdit,
  onExerciseUpdate,
}) => {
  const subjects = Object.values(Subject);
  const grades = [6, 7, 8, 9, 10, 11, 12];
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showError } = useModal();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileArray = [file];
    const { validFiles, invalidFiles } = validateFiles(fileArray, PDF_TYPES);

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles
        .map(({ file, errorMessage }) => `${file.name}: ${errorMessage}`)
        .join("\n");

      showError(
        `${t("common.someFilesIsNotValid")}\n${errorMessages}`,
        `${t("common.invalidFiles")}`
      );
      return; // Exit early if files are invalid
    }

    // Only proceed if files are valid
    if (validFiles.length === 0) {
      return; // No valid files to process
    }

    const validFile = validFiles[0]; // Use the validated file

    if (isEdit) {
      setIsUploading(true);
      setUploadError(null);

      try {
        const updatedExercise = await exerciseService.uploadFile(
          formData.id,
          validFile // Use validated file
        );
        onExerciseUpdate?.(updatedExercise);
        onInputChange("content", "");
      } catch (error) {
        console.error("File upload failed:", error);
        setUploadError("File upload failed:");
      } finally {
        setIsUploading(false);
      }
    } else {
      setSelectedFile(validFile); // Use validated file
      setUploadError(null);
      onInputChange("content", "");
    }
  };

  const handleRemoveFile = () => {
    if (isEdit) {
      // Clear file-related fields for existing exercise
      onInputChange("fileUrl", null);
      onInputChange("fileName", null);
      onInputChange("fileKey", null);
    } else {
      // Clear selected file for new exercise
      setSelectedFile(null);
    }
  };

  const handleSave = () => {
    // Pass selected file directly to parent component
    if (!isEdit && selectedFile) {
      onSave?.(selectedFile);
    } else {
      onSave?.();
    }
  };

  // Rich text editor modules
  // const quillModules = {
  //   toolbar: [
  //     [{ header: [1, 2, 3, false] }],
  //     ["bold", "italic", "underline", "strike"],
  //     [{ list: "ordered" }, { list: "bullet" }],
  //     [{ script: "sub" }, { script: "super" }],
  //     [{ indent: "-1" }, { indent: "+1" }],
  //     [{ color: [] }, { background: [] }],
  //     [{ align: [] }],
  //     ["link", "image"],
  //     ["clean"],
  //   ],
  // };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center flex-row gap-4">
          <ActionButton
            onClick={onCancel}
            colorTheme="white"
            textColor="text-red-700"
            hasIcon={true}
            icon={ArrowLeft}
            text={t("exerciseEditorUI.back")}
            size="sm"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
          </h2>
        </div>
        <div className="flex space-x-3">
          {!isEdit ? (
            <ActionButton
              onClick={handleSave}
              colorTheme="blue"
              hasIcon={true}
              icon={Plus}
              text="Tạo bài tập"
              size="md"
            />
          ) : (
            <>
              <ActionButton
                onClick={handleSave}
                colorTheme="blue"
                hasIcon={true}
                icon={Save}
                text={t("exerciseEditorUI.saveChanges")}
                size="sm"
              />
              <ActionButton
                onClick={onToggleStatus}
                colorTheme={
                  formData.status === ExerciseStatus.ACTIVE ? "yellow" : "green"
                }
                hasIcon={true}
                icon={formData.status === ExerciseStatus.ACTIVE ? Pause : Play}
                text={
                  formData.status === ExerciseStatus.ACTIVE
                    ? t("exerciseEditorUI.closeExercise")
                    : t("exerciseEditorUI.openExercise")
                }
                size="sm"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exercise Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-start">
              {t("exerciseEditorUI.exerciseInfo")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("exerciseEditorUI.exerciseName")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên bài tập"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("exerciseEditorUI.exerciseSubject")} *
                </label>
                <select
                  aria-label="Môn học"
                  value={formData.subject}
                  onChange={(e) => onInputChange("subject", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("exerciseEditorUI.exerciseGrade")} *
                </label>
                <select
                  aria-label="Lớp"
                  value={formData.grade}
                  onChange={(e) =>
                    onInputChange("grade", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("exerciseEditorUI.deadline")} *
                </label>
                <input
                  aria-label={t("exerciseEditorUI.deadline")}
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => onInputChange("deadline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("exerciseEditorUI.exerciseNote")}
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => onInputChange("note", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mô tả ngắn về bài tập"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("exerciseEditorUI.exerciseContent")}
                </h3>
              </div>
            </div>

            <div className="p-8">
              {/* File Upload Section */}
              {formData.fileUrl || selectedFile ? (
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          {formData.fileName || selectedFile?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {formData.fileUrl && (
                        <a
                          href={formData.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          {t("common.view")}
                        </a>
                      )}
                      <button
                        onClick={handleRemoveFile}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tải lên file PDF
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Nhấp để tải lên
                            </span>{" "}
                            hoặc kéo thả file
                          </p>
                          <p className="text-xs text-gray-500">Chỉ file PDF</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,application/pdf"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    {uploadError && (
                      <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                    )}
                    {isUploading && (
                      <p className="mt-2 text-sm text-blue-600">
                        Đang tải lên...
                      </p>
                    )}
                  </div>

                  {/* Text Content Editor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hoặc nhập nội dung văn bản
                    </label>
                    <RichTextEditor
                      value={formData.content || ""}
                      onChange={(content: string) =>
                        onInputChange("content", content)
                      }
                      placeholder={t("exerciseEditorUI.placeholderContent")}
                      className="min-h-[400px]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
