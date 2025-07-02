/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  ArrowLeft,
  Users,
  Clock,
  BarChart3,
  TrendingUp,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

interface QuizResult {
  studentId: number;
  studentName: string;
  score: number;
  totalPoints: number;
  timeSpent: number;
  submittedAt: string;
  answers: StudentAnswer[];
}

interface StudentAnswer {
  questionId: number;
  answer: string | number;
  isCorrect: boolean;
  points: number;
}

interface QuizDashboardProps {
  quiz: any;
  onBack: () => void;
}

export const QuizDashboard: React.FC<QuizDashboardProps> = ({
  quiz,
  onBack,
}) => {
  // Sample results data
  const [results] = useState<QuizResult[]>([
    {
      studentId: 1,
      studentName: "Nguyễn Văn An",
      score: 8,
      totalPoints: 10,
      timeSpent: 25,
      submittedAt: "2024-06-20T10:30:00",
      answers: [
        { questionId: 1, answer: 0, isCorrect: true, points: 1 },
        { questionId: 2, answer: 1, isCorrect: true, points: 1 },
      ],
    },
    {
      studentId: 2,
      studentName: "Trần Thị Bình",
      score: 6,
      totalPoints: 10,
      timeSpent: 28,
      submittedAt: "2024-06-20T11:15:00",
      answers: [
        { questionId: 1, answer: 0, isCorrect: true, points: 1 },
        { questionId: 2, answer: 2, isCorrect: false, points: 0 },
      ],
    },
    {
      studentId: 3,
      studentName: "Lê Minh Cường",
      score: 9,
      totalPoints: 10,
      timeSpent: 22,
      submittedAt: "2024-06-20T14:45:00",
      answers: [
        { questionId: 1, answer: 0, isCorrect: true, points: 1 },
        { questionId: 2, answer: 1, isCorrect: true, points: 1 },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "questions"
  >("overview");

  // Calculate statistics
  const totalSubmissions = results.length;
  const averageScore =
    totalSubmissions > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / totalSubmissions
      : 0;
  const averageTime =
    totalSubmissions > 0
      ? results.reduce((sum, r) => sum + r.timeSpent, 0) / totalSubmissions
      : 0;
  const passRate =
    totalSubmissions > 0
      ? (results.filter((r) => r.score >= 5).length / totalSubmissions) * 100
      : 0;

  // Grade distribution
  const gradeDistribution = {
    excellent: results.filter((r) => r.score >= 9).length,
    good: results.filter((r) => r.score >= 7 && r.score < 9).length,
    average: results.filter((r) => r.score >= 5 && r.score < 7).length,
    poor: results.filter((r) => r.score < 5).length,
  };

  const exportResults = () => {
    const csvContent = [
      ["Tên học sinh", "Điểm", "Tổng điểm", "Thời gian (phút)", "Ngày nộp"],
      ...results.map((result) => [
        result.studentName,
        result.score.toString(),
        result.totalPoints.toString(),
        result.timeSpent.toString(),
        new Date(result.submittedAt).toLocaleString("vi-VN"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `quiz_results_${quiz.title}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Quiz</h1>
            <p className="text-gray-600 mt-1">{quiz.title}</p>
          </div>
        </div>
        <button
          onClick={exportResults}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất kết quả
        </button>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Thời gian</p>
              <p className="font-semibold">{quiz.timeLimit} phút</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Hạn chót</p>
              <p className="font-semibold">
                {new Date(quiz.deadline).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Tổng câu hỏi</p>
              <p className="font-semibold">{quiz.totalQuestions}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <p className="font-semibold capitalize">{quiz.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "students"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Kết quả học sinh
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "questions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Phân tích câu hỏi
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tổng lượt làm
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalSubmissions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Điểm trung bình
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageScore.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Thời gian TB
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageTime.toFixed(0)} phút
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tỷ lệ đạt</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {passRate.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Phân loại kết quả
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {gradeDistribution.excellent}
                </p>
                <p className="text-sm text-gray-600">Xuất sắc (9-10)</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {gradeDistribution.good}
                </p>
                <p className="text-sm text-gray-600">Khá (7-8)</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {gradeDistribution.average}
                </p>
                <p className="text-sm text-gray-600">Trung bình (5-6)</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {gradeDistribution.poor}
                </p>
                <p className="text-sm text-gray-600">Yếu (0-4)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Kết quả chi tiết của học sinh
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học sinh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày nộp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-semibold">{result.score}</span>
                        <span className="text-gray-500">
                          /{result.totalPoints}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.timeSpent} phút
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(result.submittedAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.score >= 5 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Đạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Không đạt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Phân tích câu hỏi
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {quiz.questions?.map((question: any, index: number) => {
                const correctAnswers = results.filter(
                  (r) =>
                    r.answers.find((a) => a.questionId === question.id)
                      ?.isCorrect
                ).length;
                const accuracy =
                  totalSubmissions > 0
                    ? (correctAnswers / totalSubmissions) * 100
                    : 0;

                return (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Câu {index + 1}
                      </h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Tỷ lệ đúng</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {accuracy.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{question.question}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {correctAnswers}/{totalSubmissions} học sinh trả lời đúng
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
