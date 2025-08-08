import React, { useState } from "react";
import { IeltsLevel, IeltsWritingType } from "../../types/api";
import { RichTextEditor } from "../ui/RichTextEditor";
import { X } from "lucide-react";

interface WritingTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    prompt: string;
    type: IeltsWritingType;
    level: IeltsLevel;
  }) => Promise<void>;
}

export const WritingTaskModal: React.FC<WritingTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    type: IeltsWritingType.IELTS_TASK1,
    level: IeltsLevel.BEGINNER,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.prompt.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      setFormData({
        title: "",
        prompt: "",
        type: IeltsWritingType.IELTS_TASK1,
        level: IeltsLevel.BEGINNER,
      });
      onClose();
    } catch (error) {
      console.error("Error creating writing task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Tạo Writing Task mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              value={formData.title}
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
                value={formData.type}
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
                value={formData.level}
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
                value={formData.prompt}
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
            {formData.type === IeltsWritingType.IELTS_TASK1 ? (
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

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                isSubmitting ||
                !formData.title.trim() ||
                !formData.prompt.trim()
              }
            >
              {isSubmitting ? "Đang tạo..." : "Tạo Writing Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
