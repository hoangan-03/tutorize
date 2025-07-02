import React from "react";
import { Plus, Eye, Edit, Trash2, Calendar, Users } from "lucide-react";

interface Exercise {
  id?: number;
  name: string;
  subject: string;
  grade: number;
  deadline: string;
  note: string;
  content: string;
  latexContent: string;
  createdBy: string;
  createdAt: string;
  submissions: number;
  status: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (exercise: Exercise) => void;
  onPreview: (exercise: Exercise) => void;
  onDelete: (id: number) => void;
  onCreateNew: () => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onEdit,
  onPreview,
  onDelete,
  onCreateNew,
}) => {
  return (
    <div className="max-w-8xl mx-auto">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý bài tập
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-sm text-green-600 font-medium">
                    Hệ thống đang hoạt động
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
              Tạo, chỉnh sửa và quản lý bài tập cho học sinh. Hỗ trợ định dạng
              văn bản phong phú và LaTeX.
            </p>
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{exercises.length} bài tập</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Cập nhật gần nhất: {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-3">
            <button
              onClick={onCreateNew}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">Tạo bài tập mới</span>
            </button>
            <p className="text-xs text-gray-500 text-right">
              Nhấn để tạo bài tập
              <br />
              với trình soạn thảo nâng cao
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {exercise.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Lớp {exercise.grade}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {exercise.subject}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Hạn:{" "}
                    {new Date(exercise.deadline).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{exercise.submissions} bài nộp</span>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  exercise.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {exercise.status === "active" ? "Đang mở" : "Đã đóng"}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {exercise.note}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => onPreview(exercise)}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-1" />
                Xem
              </button>
              <button
                onClick={() => onEdit(exercise)}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Sửa
              </button>
              <button
                onClick={() => onDelete(exercise.id!)}
                className="flex items-center justify-center px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                title="Xóa bài tập"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
