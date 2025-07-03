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
  Users,
  Calendar,
} from "lucide-react";
import { quizService } from "../../services/quizService";
import { exerciseService } from "../../services/exerciseService";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [continueLearningData, setContinueLearningData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    averageScore: 0,
    studyTime: 0,
    ranking: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load user's recent submissions and progress
      const [quizSubmissions, exerciseSubmissions] = await Promise.all([
        quizService.getMySubmissions({ limit: 5 }),
        exerciseService.getMySubmissions({ limit: 5 }),
      ]);

      // Create continue learning data from recent submissions
      const continueData = [
        ...quizSubmissions.data.map((submission: any) => ({
          title: `${submission.quiz?.title || "Quiz"}`,
          type: "quiz",
          progress: Math.round(submission.score || 0),
          id: submission.quiz?.id,
        })),
        ...exerciseSubmissions.data.map((submission: any) => ({
          title: `${submission.exercise?.name || "Exercise"}`,
          type: "exercise",
          progress: submission.score ? Math.round(submission.score) : 0,
          id: submission.exercise?.id,
        })),
      ].slice(0, 3);

      setContinueLearningData(continueData);

      // Calculate stats from submissions
      const totalQuizzes = quizSubmissions.data.length;
      const avgQuizScore =
        totalQuizzes > 0
          ? quizSubmissions.data.reduce(
              (acc: number, sub: any) => acc + (sub.score || 0),
              0
            ) / totalQuizzes
          : 0;

      setStats({
        quizzesCompleted: totalQuizzes,
        averageScore: Math.round(avgQuizScore),
        studyTime: Math.floor(Math.random() * 50) + 10, // Mock for now
        ranking: Math.floor(Math.random() * 100) + 1, // Mock for now
      });

      // Set recent activities
      const activities = [
        ...quizSubmissions.data
          .slice(0, 3)
          .map(
            (sub: any) =>
              `${t("dashboard.completed")} ${sub.quiz?.title || "quiz"}`
          ),
        ...exerciseSubmissions.data
          .slice(0, 2)
          .map(
            (sub: any) =>
              `${t("dashboard.submitted")} ${sub.exercise?.name || "exercise"}`
          ),
      ];
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to empty data
      setContinueLearningData([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-8xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("dashboard.welcome")}, {user?.name}! 👋
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
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {t("dashboard.quickActions")}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full text-left p-8 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {t("dashboard.takeNewQuiz")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.challengeYourself")}
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-8 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-green-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {t("dashboard.practiceIelts")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.improveEnglish")}
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-8 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {t("dashboard.joinClass")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.learnWithFriends")}
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-8 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Target className="h-6 w-6 text-purple-600" />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {t("dashboard.viewResults")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.analyzeProgress")}
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
              {t("dashboard.upcomingDeadlines")}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("dashboard.mathExercise")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.class12A1")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">
                    {t("common.remaining")} 2 {t("dashboard.daysLeft")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("dashboard.dueDate")}: 15/03/2024
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t("dashboard.ieltsSpeak")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.ieltsPrep")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    {t("dashboard.today")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("dashboard.dueDate")}: 13/03/2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("dashboard.continueLearning")}
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              {t("dashboard.viewAll")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {continueLearningData.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-8 hover:shadow-md transition-shadow"
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
                    <span>{t("dashboard.progress")}</span>
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
                  {t("dashboard.continue")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
