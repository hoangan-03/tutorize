import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save } from "lucide-react";
import { IeltsWritingType, IeltsLevel, IeltsWritingTest } from "../../types/api";
import { useIeltsWritingTestManagement } from "../../hooks/useIeltsWriting";
import { RichTextEditor } from "../ui/RichTextEditor";
import { ieltsWritingService } from "../../services/ieltsWritingService";

interface WritingTaskFormProps {
  onBack: () => void;
  taskId?: number | null;
}

export const WritingTaskForm: React.FC<WritingTaskFormProps> = ({
  onBack,
  taskId,
}) => {
  const { t } = useTranslation();
  const { createTask, editTask } = useIeltsWritingTestManagement();
  
  const [task, setTask] = useState<Partial<IeltsWritingTest>>({
    title: "",
    prompt: "",
    type: IeltsWritingType.IELTS_TASK1,
    level: IeltsLevel.INTERMEDIATE,
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing task for editing
  useEffect(() => {
    if (taskId) {
      setLoading(true);
      ieltsWritingService
        .getTest(taskId)
        .then((existingTask) => {
          if (existingTask) {
            setTask({
              title: existingTask.title || "",
              prompt: existingTask.prompt || "",
              type: existingTask.type,
              level: existingTask.level,
            });
          }
        })
        .catch((error) => {
          console.error("Error loading writing task:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [taskId]);

  const handleInputChange = (field: keyof IeltsWritingTest, value: string | IeltsWritingType | IeltsLevel) => {
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

      if (taskId) {
        await editTask(taskId, taskData);
      } else {
        await createTask(taskData);
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t("common.back")}
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {taskId ? "Chỉnh sửa Writing Task" : "Tạo Writing Task mới"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {taskId 
                      ? "Cập nhật thông tin writing task" 
                      : "Tạo một writing task mới cho học sinh"}
                  </p>
                </div>
              </div>
              <button
                form="writing-task-form"
                type="submit"
                disabled={isSubmitting || !task.title?.trim() || !task.prompt?.trim()}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Đang lưu..." : taskId ? "Cập nhật" : "Tạo Task"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form id="writing-task-form" onSubmit={handleSubmit} className="p-6 space-y-6">
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
                    handleInputChange("type", e.target.value as IeltsWritingType)
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
              <p className="text-sm text-gray-500 mt-2">
                Bạn có thể sử dụng rich text để format đề bài, thêm hình ảnh, v.v.
              </p>
            </div>

            {/* Task Type Guidelines */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Hướng dẫn tạo đề bài:
              </h4>
              {task.type === IeltsWritingType.IELTS_TASK1 ? (
                <div className="text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>Task 1:</strong> Mô tả biểu đồ, bảng, sơ đồ hoặc quy
                    trình
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Yêu cầu viết ít nhất 150 từ</li>
                    <li>Mô tả thông tin chính, xu hướng, so sánh</li>
                    <li>Sử dụng ngôn ngữ học thuật, tránh ý kiến cá nhân</li>
                  </ul>
                </div>
              ) : (
                <div className="text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>Task 2:</strong> Viết luận về một chủ đề
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Yêu cầu viết ít nhất 250 từ</li>
                    <li>Đưa ra quan điểm, lập luận với ví dụ</li>
                    <li>Cấu trúc: mở bài, thân bài, kết luận</li>
                  </ul>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
