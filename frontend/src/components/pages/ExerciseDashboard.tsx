import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Star,
  Award,
  FileText,
  Calendar,
  PieChart,
  Target,
} from "lucide-react";
import { Exercise, ExerciseSubmission } from "../../types/api";
import { exerciseService } from "../../services/exerciseService";

interface ExerciseDashboardProps {
  exercise: Exercise;
  onBack: () => void;
}

interface ExerciseStats {
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  lateSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  submissionRate: number;
  gradeDistribution: { range: string; count: number }[];
  submissionTrend: { date: string; count: number }[];
  topPerformers: { userId: number; userName: string; score: number }[];
}

export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({
  exercise,
  onBack,
}) => {
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [submissions, setSubmissions] = useState<ExerciseSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [exercise.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load submissions
      const submissionsResult = await exerciseService.getExerciseSubmissions(
        exercise.id!
      );
      setSubmissions(submissionsResult.data);

      // Calculate stats
      calculateStats(submissionsResult.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (submissions: ExerciseSubmission[]) => {
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(
      (s) => s.status === "GRADED"
    ).length;
    const pendingSubmissions = submissions.filter(
      (s) => s.status === "SUBMITTED"
    ).length;
    const lateSubmissions = submissions.filter(
      (s) => s.status === "LATE"
    ).length;

    const gradedScores = submissions
      .filter((s) => s.score !== null)
      .map((s) => s.score!);
    const averageScore =
      gradedScores.length > 0
        ? gradedScores.reduce((sum, score) => sum + score, 0) /
          gradedScores.length
        : 0;
    const highestScore =
      gradedScores.length > 0 ? Math.max(...gradedScores) : 0;
    const lowestScore = gradedScores.length > 0 ? Math.min(...gradedScores) : 0;

    // Assume total enrolled students (placeholder)
    const totalStudents = Math.max(totalSubmissions, 50); // Mock data
    const submissionRate = (totalSubmissions / totalStudents) * 100;

    // Grade distribution
    const gradeDistribution = [
      { range: "9-10", count: gradedScores.filter((s) => s >= 9).length },
      {
        range: "7-8.9",
        count: gradedScores.filter((s) => s >= 7 && s < 9).length,
      },
      {
        range: "5-6.9",
        count: gradedScores.filter((s) => s >= 5 && s < 7).length,
      },
      {
        range: "3-4.9",
        count: gradedScores.filter((s) => s >= 3 && s < 5).length,
      },
      { range: "0-2.9", count: gradedScores.filter((s) => s < 3).length },
    ];

    // Submission trend (last 7 days)
    const submissionTrend: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = submissions.filter(
        (s) => s.submittedAt.split("T")[0] === dateStr
      ).length;
      submissionTrend.push({
        date: date.toLocaleDateString("vi-VN", {
          month: "short",
          day: "numeric",
        }),
        count,
      });
    }

    // Top performers
    const topPerformers = submissions
      .filter((s) => s.score !== null)
      .sort((a, b) => b.score! - a.score!)
      .slice(0, 5)
      .map((s) => ({
        userId: s.userId,
        userName: s.user?.name || `User ${s.userId}`,
        score: s.score!,
      }));

    setStats({
      totalSubmissions,
      gradedSubmissions,
      pendingSubmissions,
      lateSubmissions,
      averageScore,
      highestScore,
      lowestScore,
      submissionRate,
      gradeDistribution,
      submissionTrend,
      topPerformers,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không thể tải dữ liệu
          </h3>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={onBack}
                className="mb-4 text-white/80 hover:text-white flex items-center"
              >
                ← Quay lại
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">
                Dashboard: {exercise.name}
              </h1>
              <p className="text-white/90 text-lg">
                Phân tích chi tiết hiệu suất và thống kê bài tập
              </p>
            </div>
            <div className="text-right text-white/90">
              <p className="text-sm">Cập nhật lần cuối</p>
              <p className="font-medium">
                {new Date().toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tỷ lệ nộp bài
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.submissionRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Điểm trung bình
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.averageScore.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đã chấm điểm
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.gradedSubmissions}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ chấm</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.pendingSubmissions}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Grade Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
              Phân bố điểm số
            </h3>
            <div className="space-y-4">
              {stats.gradeDistribution.map((grade, index) => {
                const colors = [
                  "bg-green-500",
                  "bg-blue-500",
                  "bg-yellow-500",
                  "bg-orange-500",
                  "bg-red-500",
                ];
                const percentage =
                  stats.gradedSubmissions > 0
                    ? (grade.count / stats.gradedSubmissions) * 100
                    : 0;

                return (
                  <div key={grade.range} className="flex items-center">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {grade.range}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${colors[index]}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {grade.count} ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Trend */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Xu hướng nộp bài (7 ngày gần nhất)
            </h3>
            <div className="flex items-end space-x-2 h-40">
              {stats.submissionTrend.map((day, index) => {
                const maxCount = Math.max(
                  ...stats.submissionTrend.map((d) => d.count)
                );
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="flex-1 flex items-end">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{
                          height: `${height}%`,
                          minHeight: day.count > 0 ? "8px" : "0",
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 text-center">
                      {day.date}
                    </div>
                    <div className="text-xs font-medium text-gray-900">
                      {day.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Top học sinh xuất sắc
            </h3>
            <div className="space-y-4">
              {stats.topPerformers.map((student, index) => (
                <div
                  key={student.userId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.userName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                      {student.score.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">điểm</p>
                  </div>
                </div>
              ))}
              {stats.topPerformers.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Chưa có học sinh nào được chấm điểm
                </p>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              Tóm tắt thống kê
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalSubmissions}
                  </p>
                  <p className="text-sm text-blue-800">Tổng bài nộp</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.gradedSubmissions}
                  </p>
                  <p className="text-sm text-green-800">Đã chấm điểm</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm cao nhất:</span>
                  <span className="font-bold text-green-600">
                    {stats.highestScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm thấp nhất:</span>
                  <span className="font-bold text-red-600">
                    {stats.lowestScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bài nộp muộn:</span>
                  <span className="font-bold text-orange-600">
                    {stats.lateSubmissions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Chờ chấm điểm:</span>
                  <span className="font-bold text-yellow-600">
                    {stats.pendingSubmissions}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Hạn nộp:{" "}
                  {new Date(exercise.deadline).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
