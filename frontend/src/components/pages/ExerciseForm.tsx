import React from "react";
import { Play, Pause, FileText, Plus, Save } from "lucide-react";
import { RichTextEditor } from "../ui/RichTextEditor";
import { EditMode, Exercise, ExerciseStatus, Subject } from "../../types/api";

interface ExerciseFormProps {
  formData: Exercise;
  onInputChange: (field: string, value: unknown) => void;
  onToggleStatus: () => void;
  onSave?: () => void;
  onCancel: () => void;
  isEdit: boolean;
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({
  formData,
  onInputChange,
  onToggleStatus,
  onSave,
  onCancel,
  isEdit,
  editMode,
  onEditModeChange,
}) => {
  const subjects = Object.values(Subject);
  const grades = [6, 7, 8, 9, 10, 11, 12];

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
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập mới"}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          {!isEdit ? (
            <button
              onClick={onSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài tập
            </button>
          ) : (
            <>
              <button
                onClick={onSave}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </button>
              <button
                onClick={onToggleStatus}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  formData.status === "ACTIVE"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {formData.status === ExerciseStatus.ACTIVE ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Đóng bài tập
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Mở bài tập
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exercise Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin bài tập
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên bài tập *
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
                  Môn học *
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
                  Lớp *
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
                      Lớp {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hạn nộp *
                </label>
                <input
                  aria-label="Hạn nộp"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => onInputChange("deadline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
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
                  Nội dung bài tập
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditModeChange(EditMode.RICH)}
                    className={`px-3 py-1 text-sm rounded ${
                      editMode === EditMode.RICH
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FileText className="h-4 w-4 inline mr-1" />
                    Rich Text
                  </button>
                  {formData.subject === Subject.MATH && (
                    <button
                      onClick={() => onEditModeChange(EditMode.LATEX)}
                      className={`px-3 py-1 text-sm rounded ${
                        editMode === EditMode.LATEX
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      LaTeX
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              {editMode === "rich" ? (
                <div>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content: string) =>
                      onInputChange("content", content)
                    }
                    placeholder="Nhập nội dung bài tập..."
                    className="min-h-[400px]"
                  />
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LaTeX Content (for Mathematics)
                    </label>
                    <div className="text-xs text-gray-500 mb-2">
                      Sử dụng $...$ cho inline math, $$...$$ cho block math
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Ví dụ: $x^2 + y^2 = r^2$ hoặc $$\int_0^1 x^2 dx = \frac{1}
                      {3}$$
                    </div>
                  </div>
                  <textarea
                    value={formData.latexContent}
                    onChange={(e) =>
                      onInputChange("latexContent", e.target.value)
                    }
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Nhập LaTeX content..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
