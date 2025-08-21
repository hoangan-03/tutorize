import React from "react";
import { Play, Pause, Plus, Save, ArrowLeft } from "lucide-react";
import { RichTextEditor } from "../ui/RichTextEditor";
import { Exercise, ExerciseStatus, Subject } from "../../types/api";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../ui/ActionButton";

interface ExerciseFormProps {
  formData: Exercise;
  onInputChange: (field: string, value: unknown) => void;
  onToggleStatus: () => void;
  onSave?: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  formData,
  onInputChange,
  onToggleStatus,
  onSave,
  onCancel,
  isEdit,
}) => {
  const subjects = Object.values(Subject);
  const grades = [6, 7, 8, 9, 10, 11, 12];
  const { t } = useTranslation();

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
            colorTheme="gray"
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
              onClick={onSave || (() => {})}
              colorTheme="blue"
              hasIcon={true}
              icon={Plus}
              text="Tạo bài tập"
              size="md"
            />
          ) : (
            <>
              <ActionButton
                onClick={onSave || (() => {})}
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
                    ? t("exerciseEditorUI.pauseExercise")
                    : t("exerciseEditorUI.activateExercise")
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

        {/* Content Editor */}
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
              <RichTextEditor
                value={formData.content}
                onChange={(content: string) =>
                  onInputChange("content", content)
                }
                placeholder={t("exerciseEditorUI.placeholderContent")}
                className="min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
