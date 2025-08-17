/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  FileText,
  Award,
  PenTool,
  TrendingUp,
  Clock,
  PlayCircle,
  Target,
  Calendar,
} from "lucide-react";
import { useStudentStats } from "../../hooks/useQuiz";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Use hooks for data
  const { stats: quizStats } = useStudentStats();

  const [continueLearningData, setContinueLearningData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    averageScore: 0,
    studyTime: 0,
    ranking: 0,
  });

  useEffect(() => {
    if (quizStats) {
      setStats({
        quizzesCompleted: quizStats.totalQuizzes || 0,
        averageScore: Math.round(quizStats.averageScore || 0),
        studyTime: Math.floor(Math.random() * 50) + 10, // Mock for now
        ranking: Math.floor(Math.random() * 100) + 1, // Mock for now
      });

      // Create mock continue learning data
      setContinueLearningData([
        { title: "Recent Quiz", type: "quiz", progress: 85, id: 1 },
        { title: "Exercise", type: "exercise", progress: 92, id: 1 },
        { title: "Math Quiz", type: "quiz", progress: 78, id: 2 },
      ]);
    }
  }, [quizStats]);

  return (
      <div className="max-w-8xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900">
            {t("dashboard.welcome")}, {user?.profile?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            {t("dashboard.welcomeBack")}. {t("dashboard.continueJourney")}!
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
                  {t("dashboard.quizzesCompleted")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.quizzesCompleted}
                </p>
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
                  {t("dashboard.averageScore")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore}
                </p>
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
                  {t("dashboard.studyTime")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.studyTime}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {t("dashboard.ranking")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  #{stats.ranking}
                </p>
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
                {t("dashboard.recentActivities")}
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
                      {t("dashboard.completedMathQuiz")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.score")}: 9.2/10
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      2 {t("dashboard.hoursAgo")}
                    </p>
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
                      {t("dashboard.achievedIeltsReading")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.improved")} +1.5 {t("dashboard.score")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      1 {t("dashboard.dayAgo")}
                    </p>
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
                      {t("dashboard.completedLiterature")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.graded")}: {t("common.good")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      3 {t("dashboard.daysAgo")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 text-center border-t border-gray-200">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                {t("dashboard.viewAll")}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("dashboard.quickActions")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/documents")}
                className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg"
              >
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-800">
                  {t("dashboard.documents")}
                </span>
              </button>
              <button
                onClick={() => navigate("/quizzes")}
                className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg"
              >
                <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-800">
                  {t("dashboard.onlineQuizzes")}
                </span>
              </button>
              <button
                onClick={() => navigate("/ielts")}
                className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg"
              >
                <Award className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-800">
                  {t("dashboard.ieltsCenter")}
                </span>
              </button>
              <button
                onClick={() => navigate("/writing-grader")}
                className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg"
              >
                <PenTool className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-800">
                  {t("dashboard.writingGrader")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Continue Learning */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("dashboard.continueLearning")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {continueLearningData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-600">
                    {item.type === "quiz"
                      ? t("navigation.onlineQuizzes")
                      : t("navigation.exercises")}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">
                    {item.title}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {item.progress}% {t("dashboard.completed")}
                  </p>
                </div>
                <button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  {t("dashboard.continue")}
                </button>
              </div>
            ))}

            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {t("dashboard.exploreNew")}
              </h3>
              <p className="text-sm text-gray-600 mt-1 text-center">
                {t("dashboard.exploreDescription")}
              </p>
              <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50">
                {t("dashboard.browseCourses")}
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("dashboard.upcomingDeadlines")}
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {/* Deadline Item 1 */}
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("dashboard.mathExercise")}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t("dashboard.class12A1")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    {t("dashboard.dueDate")}: 31/12/2024
                  </p>
                </div>
              </div>

              {/* Deadline Item 2 */}
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("dashboard.ieltsSpeak")}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t("dashboard.ieltsPrep")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-600">
                    {t("dashboard.dueDate")}: 15/01/2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
};
