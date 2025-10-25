import React from "react";
import {
  Calendar,
  Users,
  BookOpen,
  CalendarClock,
  BookCheck,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExercises } from "../hooks";
import { Exercise, ExerciseStatus } from "../types/api";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { formatDate } from "../components/utils";
import { StatCard, Badge, LoadingSpinner, EmptyState } from "../components/ui";

export const ExerciseListStudentView: React.FC = () => {
  const { isTeacher } = useAuth();
  const { t } = useTranslation();
  const { exercises, isLoading } = useExercises();
  const navigate = useNavigate();

  const handleViewExercise = (exercise: Exercise) => {
    navigate(`/exercise/${exercise.id}`);
  };

  return (
    <div className="p-4 md:px-12 lg:px-36 md:py-12">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 md:p-12 mb-3 md:mb-8 overflow-hidden shadow-xl h-[70px] lg:h-[120px]">
          <div className="absolute top-0 left-0 h-full w-1 bg-white/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between w-full h-full">
            <div></div>
            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-white">
              {isTeacher
                ? t("exercises.teacher_title")
                : t("exercises.student_title")}
            </h1>

            {/* Decorative Rubik's Cube-like Element */}
            <div className="hidden md:block relative">
              <div className="relative">
                {/* Main cube structure */}
                <div className="grid grid-cols-3 gap-1 transform rotate-12">
                  {/* Top row */}
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>
                  <div className="w-6 h-6 bg-orange-400 rounded-sm"></div>
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>

                  {/* Middle row */}
                  <div className="w-6 h-6 bg-yellow-400 rounded-sm"></div>
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                  <div className="w-6 h-6 bg-blue-400 rounded-sm"></div>

                  {/* Bottom row */}
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>
                  <div className="w-6 h-6 bg-green-400 rounded-sm"></div>
                  <div className="w-6 h-6 bg-white/20 rounded-sm backdrop-blur-sm"></div>
                </div>

                {/* Side face of cube */}
                <div className="absolute top-1 left-1 grid grid-cols-3 gap-1 transform translate-x-6 -translate-y-6 rotate-12 opacity-60">
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                  <div className="w-6 h-6 bg-orange-300 rounded-sm"></div>
                </div>

                {/* Additional decorative elements */}
                <div className="absolute -top-4 -right-4 w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-white/20 rounded-full"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-purple-600" />}
            bgColor="bg-purple-100"
            label={t("exercises.total")}
            value={exercises.length}
          />
          <StatCard
            icon={<Calendar className="h-6 w-6 text-green-600" />}
            bgColor="bg-green-100"
            label={t("status.active")}
            value={
              exercises.filter(
                (ex: Exercise) => ex.status === ExerciseStatus.ACTIVE
              ).length
            }
          />
          <StatCard
            icon={<CalendarClock className="h-6 w-6 text-red-600" />}
            bgColor="bg-red-100"
            label={t("exercises.overdue")}
            value={
              exercises.filter(
                (ex: Exercise) => new Date(ex.deadline) < new Date()
              ).length
            }
          />
          {/* <StatCard
            icon={<Users className="h-6 w-6 text-orange-600" />}
            bgColor="bg-orange-100"
            label={t("exercises.completed")}
            value={
              exercises.filter(
                (ex: Exercise) => ex.submissions && ex.submissions > 0
              ).length
            }
          /> */}
        </div>

        {/* Exercises Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="sm" color="border-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exercises.map((exercise: Exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
              >
                <div className="p-2 bg-blue-100 rounded-bl-lg absolute top-0 right-0 rounded-tr-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex-col mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-start mr-2 h-14">
                      {exercise.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-start h-10 ">
                      {exercise.description}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                      <Badge variant="subject">
                        {t(`subjects.${exercise.subject.toLowerCase()}`)}
                      </Badge>
                      <Badge variant="grade">
                        {t("exercises.class")} {exercise.grade}
                      </Badge>
                      <Badge
                        variant="status"
                        className={`${
                          exercise.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : exercise.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {exercise.status === "ACTIVE"
                          ? t("status.active")
                          : exercise.status === "DRAFT"
                          ? t("status.draft")
                          : t("status.closed")}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {t("exercises.createdAt")}:{" "}
                        {formatDate(exercise.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      <span>
                        {t("exercises.deadline")}:{" "}
                        {formatDate(exercise.deadline)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <BookCheck className="h-4 w-4 mr-1" />
                      <span>
                        {t("exercises.maxScore")}: {exercise.maxScore || 0}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 text-start flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>
                        {exercise.creator?.profile?.firstName ||
                          t("exercisePublicView.defaultTeacher")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewExercise(exercise)}
                  className="w-full flex items-center text-sm justify-center px-4 py-2 bg-blue-700 text-white font-bold rounded-md hover:bg-purple-700 transition-colors"
                >
                  {" "}
                  {isTeacher
                    ? t("exercises.viewDetails")
                    : t("exercises.viewAndDo")}
                </button>
              </div>
            ))}
          </div>
        )}

        {exercises.length === 0 && !isLoading && (
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title={t("exercisePublicView.noExercises")}
            description={t("exercisePublicView.noExercisesDescription")}
          />
        )}
      </div>
    </div>
  );
};
