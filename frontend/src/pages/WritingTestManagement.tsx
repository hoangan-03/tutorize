import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save } from "lucide-react";
import { IeltsWritingType, IeltsLevel, IeltsWritingTest } from "../types/api";
import {
  useIeltsWritingTestManagement,
  useIeltsWritingTestById,
} from "../hooks";
import { RichTextEditor, ActionButton, LoadingSpinner } from "../components/ui";

interface WritingTestManageProps {
  onBack: () => void;
  testId?: number | null;
}

export const WritingTestManagement: React.FC<WritingTestManageProps> = ({
  onBack,
  testId,
}) => {
  const { t } = useTranslation();
  const { createWritingTest, editWritingTest } =
    useIeltsWritingTestManagement();

  const { test: existingTask, isLoading: loading } = useIeltsWritingTestById(
    testId || null
  );

  const [task, setTask] = useState<Partial<IeltsWritingTest>>({
    title: "",
    prompt: "",
    type: IeltsWritingType.IELTS_TASK1,
    level: IeltsLevel.INTERMEDIATE,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update task state when existingTask is loaded
  useEffect(() => {
    if (existingTask) {
      setTask({
        title: existingTask.title || "",
        prompt: existingTask.prompt || "",
        type: existingTask.type,
        level: existingTask.level,
      });
    }
  }, [existingTask]);

  const handleInputChange = (
    field: keyof IeltsWritingTest,
    value: string | IeltsWritingType | IeltsLevel
  ) => {
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task.title?.trim() || !task.prompt?.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: task.title!,
        prompt: task.prompt!,
        type: task.type!,
        level: task.level!,
      };

      if (testId) {
        await editWritingTest(testId, taskData);
      } else {
        await createWritingTest(taskData);
      }

      onBack();
    } catch (error) {
      console.error("Error saving writing task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ActionButton
                  onClick={onBack}
                  colorTheme="transparent"
                  textColor="text-gray-600"
                  hasIcon={true}
                  icon={ArrowLeft}
                  iconOnly={true}
                  title={t("common.back")}
                  className="hover:bg-gray-100"
                  size="md"
                />
                <div className="flex flex-col text-start">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {testId ? "Chỉnh sửa Writing Test" : "Tạo Writing Test mới"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {testId
                      ? "Cập nhật thông tin writing test"
                      : "Tạo một writing test mới cho học sinh"}
                  </p>
                </div>
              </div>
              <ActionButton
                onClick={() => {}} // Will be handled by form submission
                disabled={
                  isSubmitting || !task.title?.trim() || !task.prompt?.trim()
                }
                colorTheme={
                  isSubmitting || !task.title?.trim() || !task.prompt?.trim()
                    ? "gray"
                    : "blue"
                }
                hasIcon={true}
                icon={Save}
                text={
                  isSubmitting
                    ? "Đang lưu..."
                    : testId
                    ? "Cập nhật"
                    : "Tạo Task"
                }
                size="md"
                className="form-submit-btn"
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form
            id="writing-task-form"
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tiêu đề *
              </label>
              <input
                type="text"
                id="title"
                value={task.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập tiêu đề writing task..."
                required
              />
            </div>

            {/* Type and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Loại Task *
                </label>
                <select
                  id="type"
                  value={task.type || IeltsWritingType.IELTS_TASK1}
                  onChange={(e) =>
                    handleInputChange(
                      "type",
                      e.target.value as IeltsWritingType
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={IeltsWritingType.IELTS_TASK1}>
                    IELTS Writing Task 1
                  </option>
                  <option value={IeltsWritingType.IELTS_TASK2}>
                    IELTS Writing Task 2
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cấp độ *
                </label>
                <select
                  id="level"
                  value={task.level || IeltsLevel.INTERMEDIATE}
                  onChange={(e) =>
                    handleInputChange("level", e.target.value as IeltsLevel)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={IeltsLevel.BEGINNER}>Beginner</option>
                  <option value={IeltsLevel.INTERMEDIATE}>Intermediate</option>
                  <option value={IeltsLevel.ADVANCED}>Advanced</option>
                </select>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Đề bài *
              </label>
              <div className="border border-gray-300 rounded-lg">
                <RichTextEditor
                  value={task.prompt || ""}
                  onChange={(value) => handleInputChange("prompt", value)}
                  placeholder="Nhập đề bài writing task... (có thể sử dụng HTML formatting)"
                  className="border-0"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
