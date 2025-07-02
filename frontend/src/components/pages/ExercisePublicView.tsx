import React, { useState } from "react";
import { Eye, Calendar, Users, BookOpen, GraduationCap } from "lucide-react";
import { exercisesData } from "../../data/sampleData";
import { useAuth } from "../../contexts/AuthContext";

interface Exercise {
  id: number;
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

export const ExercisePublicView: React.FC = () => {
  const { isTeacher } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");

  const handleViewExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedExercise(null);
  };

  // Exercise Detail View
  if (currentView === "detail" && selectedExercise) {
    return (
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedExercise.name}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isTeacher ? "Xem chi tiết bài tập" : "Chi tiết bài tập"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>
                    Hạn:{" "}
                    {new Date(selectedExercise.deadline).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{selectedExercise.submissions} bài nộp</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  <span>Lớp {selectedExercise.grade}</span>
                </div>
              </div>
            </div>

            {/* Exercise Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Môn học</h3>
                  <p className="text-gray-600">{selectedExercise.subject}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Giáo viên</h3>
                  <p className="text-gray-600">{selectedExercise.createdBy}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ngày tạo</h3>
                  <p className="text-gray-600">
                    {new Date(selectedExercise.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Exercise Note */}
            {selectedExercise.note && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ghi chú
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{selectedExercise.note}</p>
                </div>
              </div>
            )}

            {/* Exercise Content */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nội dung bài tập
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedExercise.content }}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBackToList}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Quay lại danh sách
              </button>
              {!isTeacher && (
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Nộp bài tập
                </button>
              )}
              {isTeacher && (
                <div className="flex space-x-4">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Xem bài nộp
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Chấm điểm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exercise List View
  return (
    <div className="p-4">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bài tập từ giáo viên
          </h1>
          <p className="text-gray-600 mt-2">
            Xem và hoàn thành các bài tập được giao bởi giáo viên
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tổng bài tập
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {exercisesData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang mở</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {exercisesData.filter((ex) => ex.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Đã hoàn thành
                </p>
                <p className="text-2xl font-semibold text-gray-900">7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {exercisesData.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
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
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{exercise.submissions} bài nộp</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">GV:</span>{" "}
                    {exercise.createdBy}
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

              <button
                onClick={() => handleViewExercise(exercise)}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isTeacher ? "Xem chi tiết" : "Xem và làm bài"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
