import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  BookOpen,
  FileText,
  Award,
  PenTool,
  TrendingUp,
  Clock,
  PlayCircle,
  Target,
  Users,
  Calendar,
} from "lucide-react";
import { continueLearningData } from "../../data/sampleData";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <div className="max-w-8xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Xin chào, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Chào mừng bạn trở lại. Hãy tiếp tục hành trình học tập của bạn!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Bài quiz đã làm
                </p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Điểm trung bình
                </p>
                <p className="text-2xl font-bold text-gray-900">8.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Thời gian học
                </p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thứ hạng</p>
                <p className="text-2xl font-bold text-gray-900">#15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Hoạt động gần đây
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Hoàn thành bài quiz Toán học lớp 10
                    </p>
                    <p className="text-sm text-gray-600">Điểm: 9.2/10</p>
                    <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Đạt thành tích IELTS Reading 8.0
                    </p>
                    <p className="text-sm text-gray-600">Cải thiện +1.5 điểm</p>
                    <p className="text-xs text-gray-500 mt-1">1 ngày trước</p>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Target className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Hoàn thành bài tập Văn học
                    </p>
                    <p className="text-sm text-gray-600">Chấm điểm: Tốt</p>
                    <p className="text-xs text-gray-500 mt-1">3 ngày trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Hành động nhanh
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      Làm bài quiz mới
                    </p>
                    <p className="text-sm text-gray-600">
                      Thử thách bản thân với bài kiểm tra
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Luyện thi IELTS</p>
                    <p className="text-sm text-gray-600">
                      Cải thiện kỹ năng tiếng Anh
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      Tham gia lớp học
                    </p>
                    <p className="text-sm text-gray-600">
                      Học cùng bạn bè và giáo viên
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Target className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Xem kết quả</p>
                    <p className="text-sm text-gray-600">
                      Phân tích tiến độ học tập
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Deadline sắp tới
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Bài tập Toán học - Đạo hàm
                    </p>
                    <p className="text-sm text-gray-600">Lớp 12A1</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">
                    Còn 2 ngày
                  </p>
                  <p className="text-xs text-gray-500">Hạn: 15/03/2024</p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      IELTS Mock Test - Speaking
                    </p>
                    <p className="text-sm text-gray-600">Luyện thi IELTS</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">Hôm nay</p>
                  <p className="text-xs text-gray-500">Hạn: 13/03/2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Tiếp tục học
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {continueLearningData.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    {item.type === "quiz" && (
                      <FileText className="h-5 w-5 text-blue-600" />
                    )}
                    {item.type === "writing" && (
                      <PenTool className="h-5 w-5 text-blue-600" />
                    )}
                    {item.type === "document" && (
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tiến độ</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Tiếp tục
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
